import OpenAI from "openai";
import { SERENITY_SYSTEM_PROMPT } from "../prompts/serenityPrompt";
import { getEnv } from "../../config/env";
import AIMemory from "../../models/AIMemory";
import mongoose from "mongoose";

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
const RECENT_CHAT_WINDOW = 20;
const MAX_MEMORY_ITEMS_IN_PROMPT = 12;
const MAX_MEMORY_ITEMS_PER_USER = 60;
const MEMORY_EXTRACTION_BATCH_LIMIT = 6;
const MEMORY_EXTRACTION_HISTORY_LIMIT = 120;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
    throw new Error("OPENAI_API_KEY is not configured. Please set it in your .env file. For testing, you can use mock responses by leaving AI_ENABLED unset in development.");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("✅ OpenAI client initialized successfully");
  }

  return openaiClient;
}

function normalizeMemoryText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function isValidUserObjectId(userId?: string | null): userId is string {
  return typeof userId === "string" && mongoose.Types.ObjectId.isValid(userId);
}

async function loadUserMemories(userId: string): Promise<string[]> {
  const memoryDocs = await AIMemory.find({ userId, source: "conversation" })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(MAX_MEMORY_ITEMS_IN_PROMPT)
    .select("content -_id")
    .lean();

  return memoryDocs
    .map((doc) => doc.content?.trim())
    .filter((content): content is string => Boolean(content));
}

function buildMemoryContextSection(memories: string[]): string {
  if (memories.length === 0) {
    return "";
  }

  const bulletList = memories.map((memory) => `- ${memory}`).join("\n");
  return `\n\nUSER MEMORY CONTEXT (PRIVATE TO THE AI):\n${bulletList}\n\nUse this memory context only to personalize tone, continuity, and helpful suggestions. Do not quote this section verbatim unless the user explicitly asks you what you remember.\n`;
}

function parseExtractedMemories(rawContent: string): string[] {
  const trimmed = rawContent.trim();
  if (!trimmed) return [];

  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const payload = jsonMatch ? jsonMatch[0] : trimmed;

  try {
    const parsed = JSON.parse(payload) as { memories?: unknown };
    if (!Array.isArray(parsed.memories)) return [];

    return parsed.memories
      .filter((memory): memory is string => typeof memory === "string")
      .map((memory) => memory.trim())
      .filter((memory) => memory.length > 0);
  } catch {
    return [];
  }
}

async function extractKeyMemoriesFromHistory(params: {
  openai: OpenAI;
  olderHistory: SerenityMessage[];
  language: "en" | "pt";
  existingMemories: string[];
}): Promise<string[]> {
  const { openai, olderHistory, language, existingMemories } = params;
  const extractionHistory = olderHistory.slice(-MEMORY_EXTRACTION_HISTORY_LIMIT);
  if (extractionHistory.length === 0) return [];

  const transcript = extractionHistory
    .map((entry, index) => `${index + 1}. ${entry.role.toUpperCase()}: ${entry.content}`)
    .join("\n");

  const existingContext = existingMemories.length > 0
    ? existingMemories.map((memory) => `- ${memory}`).join("\n")
    : "- (none)";

  const extractorPrompt = `You are extracting long-term user memories from a supportive chat transcript.
Return STRICT JSON only in this format: {"memories":["..."]}.

Rules:
- Output at most ${MEMORY_EXTRACTION_BATCH_LIMIT} memories.
- Keep each memory under 160 characters.
- Keep only durable, user-specific facts/preferences/patterns useful in future chats.
- Ignore one-off details, greetings, and temporary logistics.
- Do not include sensitive secrets (passwords, exact addresses, financial credentials).
- Do not repeat existing memories.
- Write memories in ${language === "pt" ? "Portuguese (Portugal)" : "English"}.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 220,
    messages: [
      { role: "system", content: extractorPrompt },
      {
        role: "user",
        content: `Existing memories:\n${existingContext}\n\nTranscript to compress:\n${transcript}`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  return parseExtractedMemories(raw);
}

async function persistNewMemories(userId: string, candidateMemories: string[]): Promise<void> {
  if (candidateMemories.length === 0) return;

  const existingDocs = await AIMemory.find({ userId, source: "conversation" })
    .select("content -_id")
    .lean();
  const existingSet = new Set(existingDocs.map((doc) => normalizeMemoryText(doc.content)));

  const uniqueNew = candidateMemories
    .map((memory) => memory.trim())
    .filter((memory) => memory.length > 0)
    .filter((memory) => {
      const normalized = normalizeMemoryText(memory);
      if (!normalized || existingSet.has(normalized)) {
        return false;
      }
      existingSet.add(normalized);
      return true;
    });

  if (uniqueNew.length === 0) return;

  await AIMemory.insertMany(
    uniqueNew.map((content) => ({
      userId,
      content,
      source: "conversation" as const,
    }))
  );

  const totalCount = await AIMemory.countDocuments({ userId, source: "conversation" });
  if (totalCount <= MAX_MEMORY_ITEMS_PER_USER) return;

  const overflow = totalCount - MAX_MEMORY_ITEMS_PER_USER;
  const oldEntries = await AIMemory.find({ userId, source: "conversation" })
    .sort({ createdAt: 1 })
    .limit(overflow)
    .select("_id")
    .lean();

  if (oldEntries.length > 0) {
    await AIMemory.deleteMany({ _id: { $in: oldEntries.map((entry) => entry._id) } });
  }
}

async function compactOlderHistoryIntoMemories(params: {
  userId: string | null | undefined;
  isGuest: boolean;
  aiEnabled: boolean;
  hasApiKey: boolean;
  openai: OpenAI;
  olderHistory: SerenityMessage[];
  language: "en" | "pt";
  existingMemories: string[];
}): Promise<void> {
  const { userId, isGuest, aiEnabled, hasApiKey, openai, olderHistory, language, existingMemories } = params;

  if (isGuest || !aiEnabled || !hasApiKey) return;
  if (!isValidUserObjectId(userId)) return;
  if (olderHistory.length === 0) return;

  try {
    const extracted = await extractKeyMemoriesFromHistory({
      openai,
      olderHistory,
      language,
      existingMemories,
    });
    await persistNewMemories(userId, extracted);
  } catch (error) {
    console.error("AI memory compaction failed:", error);
  }
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
  // Return mock responses when AI is disabled or API key is missing
  // For testing: Set AI_ENABLED=true and OPENAI_API_KEY to use real OpenAI API
  // Case-insensitive check to handle TRUE, True, true, etc.
  const aiEnabled = process.env.AI_ENABLED?.toLowerCase() === "true";
  const hasApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '';
  
  // Log current state for debugging
  console.log("🤖 AI Chatbot Status Check:", {
    AI_ENABLED: process.env.AI_ENABLED,
    aiEnabled: aiEnabled,
    hasApiKey: hasApiKey,
    apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
  });
  
  // Use mock responses if:
  // 1. AI_ENABLED is not explicitly set to "true" (works in both dev and production)
  // 2. OR if AI_ENABLED is true but API key is missing (fallback to mocks)
  if (!aiEnabled || (aiEnabled && !hasApiKey)) {
    console.log("🤖 AI Chatbot: Using mock responses");
    if (!aiEnabled) {
      console.log("   Reason: AI_ENABLED is not set to 'true' (current value: '" + process.env.AI_ENABLED + "')");
    }
    if (aiEnabled && !hasApiKey) {
      console.log("   Reason: OPENAI_API_KEY is missing or empty");
    }
    return {
      reply: getMockResponse(message),
    };
  }
  
  console.log("🤖 AI Chatbot: Using real OpenAI API");

  const openai = getOpenAIClient();
  const env = getEnv();

  const sanitizedHistory = history
    .filter((entry) => entry && typeof entry.content === "string" && entry.content.trim().length > 0)
    .map((entry) => ({
      role: entry.role,
      content: entry.content.trim(),
    }));
  const recentHistory = sanitizedHistory.slice(-RECENT_CHAT_WINDOW);
  const olderHistory = sanitizedHistory.slice(0, Math.max(0, sanitizedHistory.length - RECENT_CHAT_WINDOW));

  const persistedMemories =
    !isGuest && isValidUserObjectId(userId)
      ? await loadUserMemories(userId)
      : [];

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
  const memoryContextSection = buildMemoryContextSection(persistedMemories);

  // STEP 4: Combine all system prompt parts
  // The order is: guest notice → base prompt → language instruction → mood context
  const fullSystemPrompt =
    systemPrefixForGuest +
    SERENITY_SYSTEM_PROMPT +
    languageInstruction +
    moodContextSection +
    memoryContextSection;

  const systemMessage: SerenityMessage = {
    role: "system",
    content: fullSystemPrompt,
  };

  // Keep a short recency window for response quality and cost efficiency.
  // Older content is compacted into persistent memory records.
  const maxHistoryMessages = Math.min(env.AI_MAX_HISTORY_MESSAGES, RECENT_CHAT_WINDOW);
  const limitedHistory = recentHistory.slice(-maxHistoryMessages);

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

    void compactOlderHistoryIntoMemories({
      userId,
      isGuest,
      aiEnabled,
      hasApiKey,
      openai,
      olderHistory,
      language,
      existingMemories: persistedMemories,
    });

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


