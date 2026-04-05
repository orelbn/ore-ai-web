"use client";

export function ConversationLegalNotice() {
  return (
    <p className="mt-3 px-2 pb-4 text-center text-sm text-foreground/70">
      By using this app you agree to our{" "}
      <a
        href="/terms"
        className="font-medium text-primary/90 underline underline-offset-2 transition-colors hover:text-primary"
      >
        terms
      </a>{" "}
      and{" "}
      <a
        href="/privacy"
        className="font-medium text-primary/90 underline underline-offset-2 transition-colors hover:text-primary"
      >
        privacy policy
      </a>
    </p>
  );
}
