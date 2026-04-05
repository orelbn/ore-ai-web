"use client";

import type { RefObject } from "react";
import type { SessionMessage } from "@/modules/chat";
import { DateHeader } from "./message-list/date-header";
import { MessageRow } from "./message-list/message-row";
import { StreamingIndicator } from "./message-list/streaming-indicator";

type MessageListProps = {
  messages: SessionMessage[];
  status: string;
  bottomAnchorRef: RefObject<HTMLDivElement | null>;
};

export function MessageList({ messages, status, bottomAnchorRef }: MessageListProps) {
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
        <DateHeader date={conversationDate} />

        <div className="space-y-4">
          {messages.map((message) => (
            <MessageRow
              key={message.id}
              message={message}
              isAnimating={status === "streaming" && message.id === lastAssistantMessageId}
            />
          ))}

          {showStreamingIndicator && <StreamingIndicator />}
        </div>

        <div ref={bottomAnchorRef} />
      </div>
    </div>
  );
}
