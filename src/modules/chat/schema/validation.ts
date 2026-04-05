import { validateUIMessages } from "ai";
import { tryCatch } from "@/lib/try-catch";
import { CHAT_MAX_MESSAGE_CHARS } from "../constants";
import { chatRequestSchema, chatSchema } from "./payloads";
import type { OreAgentUIMessage } from "@/modules/agent";

async function validateUserMessage(message: unknown) {
  let validatedMessage: OreAgentUIMessage;

  try {
    [validatedMessage] = await validateUIMessages<OreAgentUIMessage>({
      messages: [message],
    });
  } catch {
    return null;
  }

  if (validatedMessage.role !== "user") {
    return null;
  }

  if (!Array.isArray(validatedMessage.parts) || validatedMessage.parts.length === 0) {
    return null;
  }

  let totalChars = 0;
  for (const part of validatedMessage.parts) {
    if (part.type !== "text") {
      return null;
    }

    totalChars += part.text.length;
    if (totalChars > CHAT_MAX_MESSAGE_CHARS) {
      return null;
    }
  }

  if (totalChars === 0) {
    return null;
  }

  return validatedMessage;
}

export async function parseAndValidateChatRequest(rawBody: string) {
  const payload = tryCatch(() => JSON.parse(rawBody));
  if (payload.error) {
    return null;
  }

  const parsedRequest = tryCatch(() => chatRequestSchema.parse(payload.data));
  if (parsedRequest.error) {
    return null;
  }

  const { sessionId, messages } = parsedRequest.data;
  const latestMessage = messages.at(-1);
  if (!latestMessage) {
    return null;
  }

  const message = await validateUserMessage(latestMessage);
  if (!message) {
    return null;
  }

  return {
    sessionId,
    message,
  };
}

export async function parseChat(payload: unknown) {
  const parsedChat = tryCatch(() => chatSchema.parse(payload));
  if (parsedChat.error) {
    throw new Error("Invalid chat");
  }

  const { sessionId, messages: rawMessages } = parsedChat.data;
  if (Array.isArray(rawMessages) && rawMessages.length === 0) {
    return {
      sessionId,
      messages: [],
    };
  }

  const messages = await validateUIMessages<OreAgentUIMessage>({
    messages: rawMessages,
  });

  return {
    sessionId,
    messages,
  };
}
