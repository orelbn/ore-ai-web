import { extractPlainTextFromParts, type SessionMessage } from "@/modules/chat";
import { AssistantMessageRow } from "./assistant-message-row";
import { UserMessageRow } from "./user-message-row";

type ConversationMessageRowProps = {
  message: SessionMessage;
  isAnimating?: boolean;
};

export function ConversationMessageRow({
  message,
  isAnimating = false,
}: ConversationMessageRowProps) {
  const text = extractPlainTextFromParts(message.parts);

  if (message.role === "user") {
    return <UserMessageRow text={text} />;
  }

  return <AssistantMessageRow text={text} isAnimating={isAnimating} />;
}
