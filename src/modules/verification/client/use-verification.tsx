"use client";

import { useState } from "react";
import { authClient } from "@/services/auth/client";

const TURNSTILE_ACTION = "session_access";
const RETRY_MESSAGE =
	"We couldn't get things ready right now. Please try again.";
const REJECTED_MESSAGE =
	"We couldn't keep your chat session active. Please verify and try again.";

type ResetOptions = { bumpWidget?: boolean; needsSession?: boolean };
type VerificationState = {
	error: string | null;
	isPending: boolean;
	isReady: boolean;
	needsSession: boolean;
	widgetKey: number;
};

export function useVerification(
	turnstileSiteKey: string,
	initialHasSession: boolean,
) {
	const [state, setState] = useState<VerificationState>({
		error: null,
		isPending: false,
		isReady: !turnstileSiteKey,
		needsSession: !initialHasSession,
		widgetKey: 0,
	});
	const { error, isPending, isReady, needsSession, widgetKey } = state;

	function reset(nextError: string | null, options: ResetOptions = {}) {
		setState((s) => ({
			...s,
			error: nextError,
			isPending: false,
			isReady: !turnstileSiteKey,
			...(options.needsSession !== undefined && {
				needsSession: options.needsSession,
			}),
			...(options.bumpWidget && { widgetKey: s.widgetKey + 1 }),
		}));
	}

	async function handleVerified(token: string) {
		if (!needsSession) {
			setState((s) => ({ ...s, error: null, isPending: false, isReady: true }));
			return;
		}

		setState((s) => ({ ...s, error: null, isPending: true }));

		try {
			const result = await authClient.signIn.anonymous({
				fetchOptions: { headers: { "x-captcha-response": token } },
			});

			if (result.error) {
				reset(REJECTED_MESSAGE, { bumpWidget: true });
				return;
			}

			setState((s) => ({
				...s,
				error: null,
				isPending: false,
				isReady: true,
				needsSession: false,
			}));
		} catch {
			reset(REJECTED_MESSAGE, { bumpWidget: true });
		}
	}

	const canRenderChallenge =
		Boolean(turnstileSiteKey) && !isPending && !isReady;

	return {
		challenge: canRenderChallenge
			? {
					action: TURNSTILE_ACTION,
					siteKey: turnstileSiteKey,
					widgetKey,
					onError: () => reset(RETRY_MESSAGE),
					onExpired: () => reset(null),
					onToken: (token: string) => void handleVerified(token),
				}
			: null,
		error,
		isPending,
		isReady,
		handleRejected: () =>
			reset(REJECTED_MESSAGE, { needsSession: true, bumpWidget: true }),
	};
}
