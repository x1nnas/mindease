import { Request, Response } from "express";
import { getSerenityReply } from "../services/serenityService";
import { AuthRequest } from "../../middleware/auth";
import { getEnv } from "../../config/env";

interface SerenityChatBody {
  message?: string;
  history?: {
    role: "user" | "assistant" | "system";
    content: string;
  }[];
  moodContext?: string;  // Optional mood check-in context from the frontend
  language?: 'en' | 'pt';  // User's language preference (English or Portuguese)
}

/**
 * Handles chat requests to Serenity (the AI chatbot)
 * 
 * HOW IT WORKS:
 * 1. Receives the user's message, conversation history, and optional mood context
 * 2. Validates that a message is provided
 * 3. Checks if AI is enabled (for production)
 * 4. Calls the serenityService to generate a response
 * 5. Returns the AI's reply to the frontend
 * 
 * MOOD CONTEXT FLOW:
 * - Frontend sends moodContext as a formatted string (e.g., "The user recently reported feeling 'Feeling Amazing! ✨'...")
 * - Controller extracts it from req.body
 * - Passes it to serenityService which includes it in the AI prompt
 * - AI uses this context to provide more personalized responses
 */
export const serenityChat = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Extract message, history, mood context, and language from request body
    // moodContext is optional - it only exists if user did a mood check-in
    // language is optional - defaults to 'en' if not provided
    const { message, history, moodContext, language = 'en' }: SerenityChatBody = req.body ?? {};

    if (!message || typeof message !== "string") {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    // Validate message length to prevent token overflow and control costs
    const env = getEnv();
    const maxMessageLength = env.AI_MAX_MESSAGE_LENGTH;
    if (message.length > maxMessageLength) {
      res.status(400).json({
        message: `Message too long. Maximum length is ${maxMessageLength} characters.`,
        maxLength: maxMessageLength,
        receivedLength: message.length,
      });
      return;
    }

    // Feature flag check - use mock responses if AI is not enabled
    // For testing: Set AI_ENABLED=true and OPENAI_API_KEY to enable real AI responses
    // If AI_ENABLED is not set or false, use mock responses (works in both dev and production)
    const aiEnabled = process.env.AI_ENABLED === "true";
    const hasApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '';
    
    // Only show "offline" message if explicitly disabled in production AND no API key
    // Otherwise, let the service handle it (will use mocks if no API key)
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction && process.env.AI_ENABLED === "false" && !hasApiKey) {
      const isGuest = !req.user;
      const userId =
        !isGuest && req.user && typeof req.user === "object"
          ? (req.user as any).id ?? (req.user as any)._id ?? null
          : null;

      res.status(200).json({
        message: "Serenity reply generated",
        reply: "Serenity is currently offline while we're improving the app 🌱",
        meta: {
          isGuest,
          userId,
        },
      });
      return;
    }

    const isGuest = !req.user;
    const userId =
      !isGuest && req.user && typeof req.user === "object"
        ? (req.user as any).id ?? (req.user as any)._id ?? null
        : null;

    // Pass mood context and language to the service so it can be included in the AI prompt
    // This allows Serenity to understand the user's emotional state and respond in their language
    // Note: getSerenityReply now handles AI errors internally and returns a fallback message
    const result = await getSerenityReply({
      message,
      history,
      moodContext,  // Pass mood context to the service
      language,  // Pass language preference to the service
      userId,
      isGuest,
    });

    // Always return 200 OK - even if AI failed, we return a calm fallback message
    // This ensures the user experience remains smooth
    res.status(200).json({
      message: "Serenity reply generated",
      reply: result.reply,
      meta: {
        isGuest,
        userId,
      },
    });
  } catch (error) {
    // This catch block handles unexpected errors (not AI-specific)
    // e.g., validation errors, middleware errors, etc.
    console.error("Serenity chat error:", error);
    
    // Return calm message instead of technical error
    res.status(200).json({
      message: "Serenity reply generated",
      reply: "I'm having trouble responding right now. Let's try again in a moment.",
      meta: {
        isGuest: !req.user,
        userId: req.user && typeof req.user === "object"
          ? (req.user as any).id ?? (req.user as any)._id ?? null
          : null,
      },
    });
  }
};


