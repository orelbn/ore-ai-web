"use client";

import { Turnstile } from "@marsidev/react-turnstile";

type VerificationChallengeProps = {
	action: string;
	onError: () => void;
	onExpired: () => void;
	onToken: (token: string) => void;
	siteKey: string;
	widgetKey: number;
};

export function VerificationChallenge({
	action,
	onError,
	onExpired,
	onToken,
	siteKey,
	widgetKey,
}: VerificationChallengeProps) {
	return (
		<div className="flex min-h-[72px] items-center justify-center rounded-2xl border border-border/70 bg-background/80 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-sm">
			<Turnstile
				key={widgetKey}
				siteKey={siteKey}
				onError={onError}
				onExpire={onExpired}
				onSuccess={onToken}
				options={{
					action,
				}}
			/>
		</div>
	);
}
