"use client";

import type { RefObject } from "react";
import type { SessionMessage } from "@/modules/chat";
import { ConversationDateHeader } from "./conversation-message-list/conversation-date-header";
import { ConversationMessageRow } from "./conversation-message-list/conversation-message-row";
import { ConversationStreamingIndicator } from "./conversation-message-list/conversation-streaming-indicator";

type ConversationMessageListProps = {
  messages: SessionMessage[];
  status: string;
  bottomAnchorRef: RefObject<HTMLDivElement | null>;
};

export function ConversationMessageList({
  messages,
  status,
  bottomAnchorRef,
}: ConversationMessageListProps) {
  const firstMessage = messages[0];
  const lastMessage = messages.at(-1);
  const conversationDate =
    firstMessage && "createdAt" in firstMessage && firstMessage.createdAt instanceof Date
      ? firstMessage.createdAt
      : new Date();

  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;
  const showStreamingIndicator = status === "streaming" && lastMessage?.role !== "assistant";

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
      <div className="mx-auto w-full max-w-3xl pt-6">
        <ConversationDateHeader date={conversationDate} />

        <div className="space-y-4">
          {messages.map((message) => (
            <ConversationMessageRow
              key={message.id}
              message={message}
              isAnimating={status === "streaming" && message.id === lastAssistantMessageId}
            />
          ))}

          {showStreamingIndicator && <ConversationStreamingIndicator />}
        </div>

        <div ref={bottomAnchorRef} />
      </div>
    </div>
  );
}
