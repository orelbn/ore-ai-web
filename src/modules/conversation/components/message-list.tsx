"use client";

import type { RefObject } from "react";
import type { SessionMessage } from "@/modules/chat";
import { DateHeader } from "./message-list/date-header";
import { MessageRow } from "./message-list/message-row";

type MessageListProps = {
  messages: SessionMessage[];
  status: string;
  bottomAnchorRef: RefObject<HTMLDivElement | null>;
};

export function MessageList({ messages, status, bottomAnchorRef }: MessageListProps) {
  const firstMessage = messages[0];
  const conversationDate =
    firstMessage && "createdAt" in firstMessage && firstMessage.createdAt instanceof Date
      ? firstMessage.createdAt
      : new Date();

  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-6">
      <div className="mx-auto w-full max-w-5xl pt-6">
        <DateHeader date={conversationDate} />

        <div className="pb-2 [&>[data-sender=assistant]+[data-sender=assistant]]:mt-1.5 [&>[data-sender=user]+[data-sender=user]]:mt-1.5 [&>[data-sender=assistant]:has(+[data-sender=assistant])_[data-tail]]:before:hidden [&>[data-sender=user]:has(+[data-sender=user])_[data-tail]]:before:hidden">
          {messages.map((message) => (
            <MessageRow
              key={message.id}
              message={message}
              isAnimating={status === "streaming" && message.id === lastAssistantMessageId}
            />
          ))}
        </div>

        <div ref={bottomAnchorRef} />
      </div>
    </div>
  );
}
