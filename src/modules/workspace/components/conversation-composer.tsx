"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, Mic, Square } from "lucide-react";
import { CHAT_MAX_MESSAGE_CHARS } from "@/modules/chat";
import { Button } from "@/components/ui/button";

type ConversationComposerProps = {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  status: string;
  onStop: () => void;
  placeholder: string;
  showLegalNotice?: boolean;
};

export function ConversationComposer({
  input,
  onInputChange,
  onSubmit,
  status,
  onStop,
  placeholder,
  showLegalNotice = false,
}: ConversationComposerProps) {
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
    <>
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
          className="min-h-6 max-h-50 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Voice input coming soon"
            title="Voice input coming soon"
            disabled
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground/30"
          >
            <Mic className="size-4.5" strokeWidth={1.8} />
          </button>
          <Button
            type={status === "streaming" ? "button" : "submit"}
            size="icon"
            title={status === "streaming" ? "Stop response" : "Send message"}
            aria-label={status === "streaming" ? "Stop response" : "Send message"}
            onClick={status === "streaming" ? onStop : undefined}
            className="size-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            disabled={status !== "streaming" && (status === "submitted" || !input.trim())}
          >
            {status === "streaming" ? (
              <Square className="size-3.5 fill-current" strokeWidth={2} />
            ) : (
              <ArrowUp className="size-4" strokeWidth={2} />
            )}
          </Button>
        </div>
      </form>
      {showLegalNotice ? (
        <p className="mt-2 px-1 text-center text-xs text-muted-foreground/50">
          By using this chat you agree to our{" "}
          <a
            href="/terms"
            className="text-primary/70 underline underline-offset-2 transition-colors hover:text-primary"
          >
            terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-primary/70 underline underline-offset-2 transition-colors hover:text-primary"
          >
            privacy policy
          </a>
          .
        </p>
      ) : null}
    </>
  );
}
