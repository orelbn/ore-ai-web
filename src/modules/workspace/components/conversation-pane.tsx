"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useState } from "react";
import { createEmptyChat, type SessionMessage } from "@/modules/chat";
import { useConversationSubmission } from "../client/use-conversation-submission";
import { ConversationPaneContent } from "./conversation-pane/conversation-pane-content";
import { WorkspaceHeader } from "./workspace-header";

export { FEATURE_CARDS } from "./conversation-pane/feature-cards";

type ConversationPaneProps = {
  messages: SessionMessage[];
  sessionId: string;
};

export function ConversationPane({ messages, sessionId }: ConversationPaneProps) {
  const [activeSessionId, setActiveSessionId] = useState(sessionId);

  useEffect(() => {
    setActiveSessionId(sessionId);
  }, [sessionId]);

  const initialMessages = activeSessionId === sessionId ? messages : [];

  const {
    error,
    messages: activeMessages,
    sendMessage: sendChatMessage,
    status,
    stop,
  } = useChat<SessionMessage>({
    id: activeSessionId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  const { handleSubmit, input, setInput } = useConversationSubmission({
    sendMessage(message) {
      return sendChatMessage(message, {
        body: {
          sessionId: activeSessionId,
        },
      });
    },
    status,
  });

  return (
    <section className="flex h-full min-h-0 flex-col">
      <WorkspaceHeader
        onResetConversation={() => {
          setActiveSessionId(createEmptyChat().sessionId);
        }}
      />
      <ConversationPaneContent
        error={error}
        input={input}
        messages={activeMessages}
        onInputChange={setInput}
        onPromptSelect={setInput}
        onStop={stop}
        onSubmit={handleSubmit}
        status={status}
      />
    </section>
  );
}
