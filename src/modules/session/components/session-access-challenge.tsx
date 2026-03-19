"use client";

import { TurnstileWidget } from "@/services/cloudflare/turnstile-widget";

type SessionAccessChallengeProps = {
	action: string;
	siteKey: string;
	widgetKey: number;
	onToken: (token: string) => void;
	onError: () => void;
	onExpired: () => void;
};

export function SessionAccessChallenge({
	action,
	siteKey,
	widgetKey,
	onToken,
	onError,
	onExpired,
}: SessionAccessChallengeProps) {
	return (
		<div className="mt-3 flex justify-center">
			<TurnstileWidget
				key={widgetKey}
				siteKey={siteKey}
				action={action}
				appearance="always"
				onToken={onToken}
				onError={onError}
				onExpired={onExpired}
			/>
		</div>
	);
}
