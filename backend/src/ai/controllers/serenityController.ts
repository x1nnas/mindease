import { Request, Response } from "express";
import { getSerenityReply } from "../services/serenityService";
import { AuthRequest } from "../../middleware/auth";

interface SerenityChatBody {
  message?: string;
  history?: {
    role: "user" | "assistant" | "system";
    content: string;
  }[];
}

export const serenityChat = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { message, history }: SerenityChatBody = req.body ?? {};

    if (!message || typeof message !== "string") {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    // Feature flag check - only show offline message in production
    // In development, let the service handle mock responses
    if (process.env.NODE_ENV === "production" && process.env.AI_ENABLED !== "true") {
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

    const result = await getSerenityReply({
      message,
      history,
      userId,
      isGuest,
    });

    res.status(200).json({
      message: "Serenity reply generated",
      reply: result.reply,
      meta: {
        isGuest,
        userId,
      },
    });
  } catch (error) {
    console.error("Serenity chat error:", error);
    res.status(500).json({ message: "Failed to generate Serenity response" });
  }
};


