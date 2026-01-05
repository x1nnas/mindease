import OpenAI from "openai";
import { SERENITY_SYSTEM_PROMPT } from "../prompts/serenityPrompt";

export interface SerenityMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface SerenityRequest {
  message: string;
  history?: SerenityMessage[];
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

export async function getSerenityReply({
  message,
  history = [],
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

  const systemPrefixForGuest = isGuest
    ? "This user is currently using a limited guest experience. You may gently mention that more personalized support is available when they create an account, but you must still be as helpful as possible right now.\n\n"
    : "";

  const systemMessage: SerenityMessage = {
    role: "system",
    content: systemPrefixForGuest + SERENITY_SYSTEM_PROMPT,
  };

  const conversation: SerenityMessage[] = [
    systemMessage,
    ...history,
    {
      role: "user",
      content: message,
    },
  ];

  const userIdentifier = userId ?? (isGuest ? "guest" : undefined);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: conversation,
    user: userIdentifier,
  });

  const reply =
    response.choices[0]?.message?.content?.trim() ??
    "I'm having trouble responding right now. Please try again in a moment.";

  return { reply };
}


