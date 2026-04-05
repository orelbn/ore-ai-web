"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { chatQueryOptions, createEmptyChat, type SessionMessage } from "@/modules/chat";
import { Header } from "./header";
import { Pane } from "./pane";

type ConversationProps = {
  messages: SessionMessage[];
  sessionId: string;
};

export function Conversation({ messages, sessionId }: ConversationProps) {
  const queryClient = useQueryClient();
  const [isConversationEmpty, setIsConversationEmpty] = useState(messages.length === 0);

  return (
    <main className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="page-background-glow page-background-glow-top-left absolute -left-64 -top-64 opacity-60" />
        <div className="page-background-glow page-background-glow-bottom-right absolute -bottom-48 -right-48 opacity-50" />
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {!isConversationEmpty ? (
          <Header
            onResetConversation={() => {
              queryClient.setQueryData(chatQueryOptions.queryKey, createEmptyChat());
            }}
          />
        ) : null}
        <Pane
          key={sessionId}
          messages={messages}
          sessionId={sessionId}
          onEmptyStateChange={setIsConversationEmpty}
        />
      </div>
    </main>
  );
}
