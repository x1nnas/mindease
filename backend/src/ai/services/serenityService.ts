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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getSerenityReply({
  message,
  history = [],
  userId,
  isGuest = false,
}: SerenityRequest): Promise<SerenityResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

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


