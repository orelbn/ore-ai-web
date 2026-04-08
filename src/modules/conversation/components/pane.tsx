"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useState } from "react";
import type { SessionMessage } from "@/modules/chat";
import { useAutoScroll } from "../client/use-auto-scroll";
import { useVoiceInput } from "../client/use-voice-input";
import { Composer } from "./composer";
import { LegalNotice } from "./legal-notice";
import { MessageList } from "./message-list";
import { EmptyView } from "./pane/empty-view";

export { FEATURE_CARDS } from "../data/feature-cards";

type PaneProps = {
  messages: SessionMessage[];
  onEmptyStateChange?: (isEmpty: boolean) => void;
  sessionId: string;
};

export function Pane({ messages, onEmptyStateChange, sessionId }: PaneProps) {
  const [input, setInput] = useState("");
  const {
    error,
    messages: activeMessages,
    sendMessage,
    status,
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

  const voiceInput = useVoiceInput({ onInputChange: setInput });
  const bottomAnchorRef = useAutoScroll(activeMessages.length);
  const isEmpty = activeMessages.length === 0;
  const visibleErrorMessage =
    voiceInput.errorMessage ||
    error?.message ||
    (error ? "Something went wrong. Please try again." : null);

  useEffect(() => {
    onEmptyStateChange?.(isEmpty);
  }, [isEmpty, onEmptyStateChange]);

  const composer = (
    <Composer
      errorMessage={visibleErrorMessage}
      input={input}
      onInputChange={setInput}
      onSubmit={handleSubmit}
      status={status}
      placeholder="Message OreAI…"
      isRecording={voiceInput.isRecording}
      isTranscribing={voiceInput.isTranscribing}
      onVoiceClick={voiceInput.onVoiceClick}
    />
  );

  return (
    <section className="flex h-full min-h-0 flex-col">
      {isEmpty ? (
        <EmptyView composer={composer} onPromptSelect={submitMessage} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <MessageList
            messages={activeMessages}
            status={status}
            bottomAnchorRef={bottomAnchorRef}
          />
          <div className="px-4 pb-4 pt-3 sm:px-6">
            {composer}
          </div>
        </div>
      )}
      {isEmpty && <LegalNotice />}
    </section>
  );
}
