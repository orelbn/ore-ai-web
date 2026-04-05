"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import type { SessionMessage } from "@/modules/chat";
import { useAutoScroll } from "../client/use-auto-scroll";
import { ConversationComposer } from "./conversation-composer";
import { ConversationLegalNotice } from "./conversation-legal-notice";
import { ConversationMessageList } from "./conversation-message-list";
import { ConversationEmptyView } from "./conversation-pane/conversation-empty-view";

export { FEATURE_CARDS } from "./conversation-pane/feature-cards";

type ConversationPaneProps = {
  messages: SessionMessage[];
  sessionId: string;
};

export function ConversationPane({ messages, sessionId }: ConversationPaneProps) {
  const [input, setInput] = useState("");
  const {
    error,
    messages: activeMessages,
    sendMessage,
    status,
    stop,
  } = useChat<SessionMessage>({
    id: sessionId,
    messages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  async function submitMessage(promptText: string) {
    const trimmedInput = promptText.trim();
    if (!trimmedInput || status === "submitted" || status === "streaming") {
      return;
    }

    setInput("");
    await sendMessage({ text: trimmedInput }, { body: { sessionId } });
  }

  async function handleSubmit() {
    await submitMessage(input);
  }
  const bottomAnchorRef = useAutoScroll(activeMessages.length);
  const isEmpty = activeMessages.length === 0;
  const visibleErrorMessage =
    error?.message || (error ? "Something went wrong. Please try again." : null);

  const composer = (
    <ConversationComposer
      input={input}
      onInputChange={setInput}
      onSubmit={handleSubmit}
      status={status}
      onStop={stop}
      placeholder="Message OreAI…"
    />
  );

  return (
    <section className="flex h-full min-h-0 flex-col">
      {isEmpty ? (
        <ConversationEmptyView composer={composer} onPromptSelect={submitMessage} />
      ) : (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col">
            <ConversationMessageList
              messages={activeMessages}
              status={status}
              bottomAnchorRef={bottomAnchorRef}
            />
            <div className="px-4 pb-4 pt-3 sm:px-6">
              <div className="mx-auto w-full max-w-3xl">{composer}</div>
            </div>
          </div>
        </div>
      )}
      {isEmpty && <ConversationLegalNotice />}
      {visibleErrorMessage && (
        <p className="mt-2 px-2 text-xs text-destructive" role="alert">
          {visibleErrorMessage}
        </p>
      )}
    </section>
  );
}
