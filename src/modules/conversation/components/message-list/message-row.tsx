import { extractPlainTextFromParts, type SessionMessage } from "@/modules/chat";
import { AssistantMessageRow } from "./assistant-message-row";
import { UserMessageRow } from "./user-message-row";

type MessageRowProps = {
  message: SessionMessage;
  isAnimating?: boolean;
};

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function MessageRow({ message, isAnimating = false }: MessageRowProps) {
  const text = extractPlainTextFromParts(message.parts);
  const timestamp =
    "createdAt" in message && message.createdAt instanceof Date
      ? timeFormatter.format(message.createdAt)
      : null;

  if (message.role === "user") {
    return <UserMessageRow text={text} timestamp={timestamp} />;
  }

  return <AssistantMessageRow text={text} timestamp={timestamp} isAnimating={isAnimating} />;
}
