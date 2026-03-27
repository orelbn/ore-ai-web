import { CHAT_DEFAULT_TITLE } from "../server/constants";
import { CHAT_PREVIEW_MAX_CHARS, CHAT_TITLE_MAX_CHARS } from "../constants";

type TextMessagePart = {
  type?: unknown;
  text?: unknown;
};

export function extractPlainTextFromParts(parts: readonly TextMessagePart[]): string {
  return parts
    .flatMap((part) => {
      if (part.type !== "text" || typeof part.text !== "string") {
        return [];
      }
      return [part.text];
    })
    .join("\n")
    .trim();
}

export function buildTitleFromInput(text: string, fallbackTitle = CHAT_DEFAULT_TITLE): string {
  const value = text.trim();
  if (!value) {
    return fallbackTitle;
  }

  return value.slice(0, CHAT_TITLE_MAX_CHARS);
}

export function buildPreviewFromInput(text: string): string {
  return text.slice(0, CHAT_PREVIEW_MAX_CHARS);
}
