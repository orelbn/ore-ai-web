"use client";

import { RefreshCw } from "lucide-react";

type WorkspaceHeaderProps = {
  onResetConversation: () => void;
};

export function WorkspaceHeader({ onResetConversation }: WorkspaceHeaderProps) {
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
        <span className="font-mono text-xs font-semibold tracking-widest text-foreground/80 uppercase">
          OreAI
        </span>
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
