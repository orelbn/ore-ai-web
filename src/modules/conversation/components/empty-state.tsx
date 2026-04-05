"use client";

export function EmptyState() {
  return (
    <div className="mb-4 flex flex-col items-center gap-3 text-center sm:mb-6 sm:gap-4">
      <div className="relative">
        {/* Atmospheric glow behind avatar */}
        <div
          className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-2xl"
          aria-hidden="true"
        />
        {/* Avatar container */}
        <div className="relative rounded-full bg-muted p-1.5 shadow-lg shadow-primary/10">
          <div className="flex size-24 items-center justify-center rounded-full bg-background sm:size-32">
            <img
              src="/ore-ai.webp"
              alt=""
              width={60}
              height={60}
              className="w-[60px] rounded-full sm:w-[72px]"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        <p className="font-mono text-xs font-semibold tracking-widest text-primary uppercase">
          OreAI
        </p>
        <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-3xl">
          What would you like to talk about?
        </h1>
      </div>
    </div>
  );
}
