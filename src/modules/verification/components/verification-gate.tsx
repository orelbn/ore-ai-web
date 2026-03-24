"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useVerificationGate } from "../client/use-verification-gate";

type VerificationGateProps = {
	onAccessGranted: () => void;
	turnstileSiteKey: string;
};

export function VerificationGate({
	onAccessGranted,
	turnstileSiteKey,
}: VerificationGateProps) {
	const { errorMessage, isCreatingSession, widgetKey, turnstileProps } =
		useVerificationGate(onAccessGranted);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4">
			<Turnstile
				key={widgetKey}
				siteKey={turnstileSiteKey}
				{...turnstileProps}
			/>
			{isCreatingSession ? (
				<p className="text-sm text-muted-foreground">Preparing session…</p>
			) : null}
			{errorMessage ? (
				<p className="text-sm text-destructive" role="alert">
					{errorMessage}
				</p>
			) : null}
		</main>
	);
}
