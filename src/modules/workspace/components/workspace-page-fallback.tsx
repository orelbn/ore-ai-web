"use client";

import { useEffect, useState } from "react";

const FALLBACK_REVEAL_DELAY_MS = 150;

export function WorkspacePageFallback() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsVisible(true);
    }, FALLBACK_REVEAL_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!isVisible) {
    return <main className="min-h-screen bg-background" aria-hidden="true" />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6">
      <div className="flex size-24 items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-border/50">
        <img
          src="/ore-ai.webp"
          alt=""
          width={88}
          height={88}
          className="rounded-full"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="space-y-2 text-center" role="status" aria-live="polite" aria-busy="true">
        <h1 className="text-xl font-semibold tracking-tight">Loading your workspace</h1>
        <p className="text-sm text-muted-foreground">
          Ore AI is warming up the conversation context and getting the workspace ready.
        </p>
      </div>
    </main>
  );
}
