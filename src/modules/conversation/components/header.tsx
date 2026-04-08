"use client";

import { RefreshCw } from "lucide-react";

type HeaderProps = {
  onResetConversation: () => void;
};

export function Header({ onResetConversation }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-border/50">
          <img
            src="/ore-ai.webp"
            alt=""
            width={24}
            height={24}
            className="rounded-full"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">Ore AI</p>
          <p className="text-xs text-muted-foreground/80">Online</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onResetConversation}
        title="New chat"
        aria-label="New chat"
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground hover:shadow-sm"
      >
        <RefreshCw className="size-5" />
      </button>
    </header>
  );
}
