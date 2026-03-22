"use client";

import { Turnstile } from "@marsidev/react-turnstile";

type VerificationGateProps = {
	challenge: {
		action: string;
		onError: () => void;
		onExpired: () => void;
		onToken: (token: string) => void;
		siteKey: string;
		widgetKey: number;
	} | null;
	error: string | null;
	isPending: boolean;
};

export function VerificationGate({
	challenge,
	error,
	isPending,
}: VerificationGateProps) {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4">
			{challenge ? (
				<Turnstile
					key={challenge.widgetKey}
					siteKey={challenge.siteKey}
					onError={challenge.onError}
					onExpire={challenge.onExpired}
					onSuccess={challenge.onToken}
					className="h-40"
					options={{
						action: challenge.action,
					}}
				/>
			) : null}
			{isPending ? (
				<p className="text-sm text-muted-foreground">
					Preparing secure session…
				</p>
			) : null}
			{error ? (
				<p className="text-sm text-destructive" role="alert">
					{error}
				</p>
			) : null}
		</main>
	);
}
