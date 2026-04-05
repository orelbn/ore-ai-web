"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useGate } from "../client/use-gate";

type GateProps = {
  onAccessGranted: () => void;
  turnstileSiteKey: string;
};

export function Gate({ onAccessGranted, turnstileSiteKey }: GateProps) {
  const { errorMessage, isCreatingSession, widgetKey, turnstileProps } = useGate(onAccessGranted);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Turnstile key={widgetKey} siteKey={turnstileSiteKey} {...turnstileProps} />
      {isCreatingSession && <p className="text-sm text-muted-foreground">Preparing session…</p>}
      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
    </main>
  );
}
