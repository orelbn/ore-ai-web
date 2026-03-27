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
  const conversationDate =
    firstMessage && "createdAt" in firstMessage && firstMessage.createdAt instanceof Date
      ? firstMessage.createdAt
      : new Date();

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
      <div className="mx-auto w-full max-w-3xl pt-6">
        <ConversationDateHeader date={conversationDate} />

        <div className="space-y-4">
          {messages.map((message) => (
            <ConversationMessageRow key={message.id} message={message} />
          ))}

          {status === "streaming" && messages[messages.length - 1]?.role !== "assistant" ? (
            <ConversationStreamingIndicator />
          ) : null}
        </div>

        <div ref={bottomAnchorRef} />
      </div>
    </div>
  );
}
