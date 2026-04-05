export function AssistantAvatar() {
  return (
    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20 dark:bg-primary/15 dark:ring-primary/30">
      <img
        src="/ore-ai.webp"
        alt=""
        width={22}
        height={22}
        className="rounded-full"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
