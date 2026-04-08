"use client";

import { useEffect, useRef } from "react";
import { LoaderCircle, Mic, SendHorizontal, Square } from "lucide-react";
import { CHAT_MAX_MESSAGE_CHARS } from "@/modules/chat";
import { Button } from "@/components/ui/button";

type ComposerProps = {
  errorMessage?: string | null;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  status: string;
  placeholder: string;
  isRecording: boolean;
  isTranscribing: boolean;
  onVoiceClick: () => void;
};

export function Composer({
  errorMessage,
  input,
  onInputChange,
  onSubmit,
  status,
  placeholder,
  isRecording,
  isTranscribing,
  onVoiceClick,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    void input;
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const MAX_TEXTAREA_HEIGHT = 200;
    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [input]);

  return (
    <div className="relative max-w-5xl mx-auto w-full">
      {errorMessage && (
        <p
          className="absolute left-1/2 top-0 z-10 w-max max-w-[calc(100%-1rem)] -translate-x-1/2 -translate-y-[calc(100%+0.625rem)] rounded-full bg-background/95 px-3 py-1 text-center text-xs font-medium text-destructive shadow-sm ring-1 ring-destructive/15 backdrop-blur-sm"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await onSubmit();
        }}
        className="flex items-end gap-2 rounded-2xl border border-border/40 bg-card/80 px-3 py-2.5 shadow-sm backdrop-blur-sm"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={async (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              await onSubmit();
            }
          }}
          placeholder={placeholder}
          rows={1}
          maxLength={CHAT_MAX_MESSAGE_CHARS}
          disabled={isTranscribing}
          className="min-h-6 max-h-50 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={
              isTranscribing
                ? "Transcribing voice input"
                : isRecording
                  ? "Stop voice recording"
                  : "Start voice recording"
            }
            title={
              isTranscribing
                ? "Transcribing voice input"
                : isRecording
                  ? "Stop voice recording"
                  : "Start voice recording"
            }
            onClick={onVoiceClick}
            disabled={isTranscribing || status === "submitted" || status === "streaming"}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            {isTranscribing ? (
              <LoaderCircle className="size-4 animate-spin" strokeWidth={1.8} />
            ) : isRecording ? (
              <Square className="size-3.5 fill-current text-destructive" strokeWidth={2} />
            ) : (
              <Mic className="size-4.5" strokeWidth={1.8} />
            )}
          </button>
          <Button
            type="submit"
            size="icon"
            title="Send message"
            aria-label="Send message"
            className="size-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            disabled={status === "submitted" || status === "streaming" || !input.trim()}
          >
            <SendHorizontal className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
