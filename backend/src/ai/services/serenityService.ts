import OpenAI from "openai";
import { SERENITY_SYSTEM_PROMPT } from "../prompts/serenityPrompt";
import { getEnv } from "../../config/env";

export interface SerenityMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SerenityRequest {
  message: string;
  history?: SerenityMessage[];
  moodContext?: string;  // Optional mood check-in context from frontend
  language?: 'en' | 'pt';  // User's language preference
  userId?: string | null;
  isGuest?: boolean;
}

export interface SerenityResponse {
  reply: string;
}

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
    throw new Error("OPENAI_API_KEY is not configured. Please set it in your .env file.");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

// Mock responses for development when AI is disabled
const getMockResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("sad") || lowerMessage.includes("depressed") || lowerMessage.includes("down")) {
    return "That sounds really overwhelming. Want to tell me a bit more about what's been weighing on you?";
  }
  
  if (lowerMessage.includes("anxious") || lowerMessage.includes("worried") || lowerMessage.includes("stress")) {
    return "I hear that anxiety can feel really intense. What's been triggering these feelings for you?";
  }
  
  if (lowerMessage.includes("angry") || lowerMessage.includes("mad") || lowerMessage.includes("frustrated")) {
    return "It sounds like you're dealing with a lot right now. What's making you feel this way?";
  }
  
  if (lowerMessage.includes("happy") || lowerMessage.includes("good") || lowerMessage.includes("great")) {
    return "I'm glad to hear you're feeling good! What's been going well for you lately?";
  }
  
  if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
    return "I'm here to listen and support you. What's on your mind today?";
  }
  
  // Default response
  return "That sounds really overwhelming. Want to tell me a bit more about what's been weighing on you?";
};

/**
 * Generates a reply from Serenity (the AI chatbot)
 * 
 * HOW IT WORKS:
 * 1. Checks if AI is enabled (returns mock response if not)
 * 2. Builds a system message that includes:
 *    - Guest user notice (if applicable)
 *    - Base system prompt (defines Serenity's personality and behavior)
 *    - Mood context (if user did a mood check-in)
 * 3. Constructs conversation array with system message, history, and current message
 * 4. Calls OpenAI API to generate response
 * 5. Returns the AI's reply
 * 
 * MOOD CONTEXT INTEGRATION:
 * - If moodContext is provided, it's appended to the system prompt
 * - This gives the AI information about the user's emotional state
 * - The AI can then reference this in its responses (e.g., "I see you mentioned feeling...")
 * - This makes responses more personalized and empathetic
 */
export async function getSerenityReply({
  message,
  history = [],
  moodContext,
  language = 'en',
  userId,
  isGuest = false,
}: SerenityRequest): Promise<SerenityResponse> {
  // Return mock responses in development when AI is disabled
  if (process.env.NODE_ENV !== "production" && process.env.AI_ENABLED !== "true") {
    return {
      reply: getMockResponse(message),
    };
  }

  const openai = getOpenAIClient();

  // STEP 1: Build guest user prefix (if applicable)
  const systemPrefixForGuest = isGuest
    ? "This user is currently using a limited guest experience. You may gently mention that more personalized support is available when they create an account, but you must still be as helpful as possible right now.\n\n"
    : "";

  // STEP 2: Build language instruction section
  // This tells Serenity to respond in the user's preferred language
  const languageInstruction = language === 'pt'
    ? `\n\nLANGUAGE PREFERENCE:\nThe user prefers to communicate in Portuguese (Portugal). Always respond in Portuguese (Portugal), using the Portuguese variant from Portugal (not Brazilian Portuguese). Use "tu" (informal) instead of "você" when addressing the user. Use Portuguese expressions and phrasing natural to Portugal.\n`
    : `\n\nLANGUAGE PREFERENCE:\nThe user prefers to communicate in English. Always respond in English.\n`;

  // STEP 3: Build mood context section (if available)
  // This adds information about the user's recent mood check-in to the system prompt
  const moodContextSection = moodContext
    ? `\n\nUSER MOOD CONTEXT:\n${moodContext}\n\nUse this context to understand the user's current emotional state. You can reference it naturally in your responses, but don't force it. If the user's message doesn't relate to their mood, focus on what they're saying now.\n`
    : "";

  // STEP 4: Combine all system prompt parts
  // The order is: guest notice → base prompt → language instruction → mood context
  const fullSystemPrompt = systemPrefixForGuest + SERENITY_SYSTEM_PROMPT + languageInstruction + moodContextSection;

  const systemMessage: SerenityMessage = {
    role: "system",
    content: fullSystemPrompt,
  };

  // Limit conversation history to prevent token overflow and control costs
  // Only keep the most recent N messages (default: 10)
  const env = getEnv();
  const maxHistoryMessages = env.AI_MAX_HISTORY_MESSAGES;
  const limitedHistory = history.slice(-maxHistoryMessages);

  const conversation: SerenityMessage[] = [
    systemMessage,
    ...limitedHistory,
    {
      role: "user",
      content: message,
    },
  ];

  const userIdentifier = userId ?? (isGuest ? "guest" : undefined);

  // Set max_tokens to limit response length and control costs
  // Default: 500 tokens (~375 words) - enough for 2-4 paragraphs
  const maxTokens = env.AI_MAX_TOKENS;

  // Calm fallback message for AI failures
  const fallbackMessage = "I'm having trouble responding right now. Let's try again in a moment.";

  try {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: conversation,
    user: userIdentifier,
      max_tokens: maxTokens, // Limit output tokens to control costs
  });

  const reply =
      response.choices[0]?.message?.content?.trim() ?? fallbackMessage;

  return { reply };
  } catch (error) {
    // Log error for debugging (but don't expose technical details to user)
    console.error("OpenAI API error:", error);

    // Check for specific error types to provide better logging
    if (error instanceof Error) {
      // Rate limit errors
      if (error.message.includes("rate_limit") || error.message.includes("429")) {
        console.error("OpenAI rate limit exceeded");
      }
      // Authentication errors
      else if (error.message.includes("401") || error.message.includes("authentication")) {
        console.error("OpenAI authentication failed - check API key");
      }
      // Token limit errors
      else if (error.message.includes("token") || error.message.includes("context_length")) {
        console.error("OpenAI token limit exceeded");
      }
      // Network/timeout errors
      else if (error.message.includes("timeout") || error.message.includes("network")) {
        console.error("OpenAI network/timeout error");
      }
    }

    // Return calm fallback message instead of throwing
    // This ensures the user always gets a response, even if AI fails
    return { reply: fallbackMessage };
  }
}


