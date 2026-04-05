import { extractPlainTextFromParts, type SessionMessage } from "@/modules/chat";
import { AssistantMessageRow } from "./assistant-message-row";
import { UserMessageRow } from "./user-message-row";

type MessageRowProps = {
  message: SessionMessage;
  isAnimating?: boolean;
};

export function MessageRow({ message, isAnimating = false }: MessageRowProps) {
  const text = extractPlainTextFromParts(message.parts);

  if (message.role === "user") {
    return <UserMessageRow text={text} />;
  }

  return <AssistantMessageRow text={text} isAnimating={isAnimating} />;
}
