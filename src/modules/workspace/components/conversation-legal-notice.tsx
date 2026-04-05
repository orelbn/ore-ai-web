"use client";

export function ConversationLegalNotice() {
  return (
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
  );
}
