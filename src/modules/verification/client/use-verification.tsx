"use client";

import { useState } from "react";
import { authClient } from "@/services/auth/client";

const TURNSTILE_ACTION = "session_access";
const RETRY_MESSAGE =
	"We couldn't get things ready right now. Please try again.";
const REJECTED_MESSAGE =
	"We couldn't keep your chat session active. Please verify and try again.";

type VerificationState = {
	error: string | null;
	isPending: boolean;
	isReady: boolean;
	needsSession: boolean;
	widgetKey: number;
};

function createVerificationState(
	initialHasSession: boolean,
): VerificationState {
	return {
		error: null,
		isPending: false,
		isReady: false,
		needsSession: !initialHasSession,
		widgetKey: 0,
	};
}

export function useVerification(
	turnstileSiteKey: string,
	initialHasSession: boolean,
) {
	const [state, setState] = useState(() =>
		createVerificationState(initialHasSession),
	);
	const { error, isPending, isReady, needsSession, widgetKey } = state;
	const canRenderChallenge =
		Boolean(turnstileSiteKey) && !isPending && !isReady;

	function resetVerification(nextError: string | null) {
		setState((current) => ({
			...current,
			error: nextError,
			isPending: false,
			isReady: false,
			widgetKey: current.widgetKey + 1,
		}));
	}

	async function handleVerified(token: string) {
		if (!needsSession) {
			setState((current) => ({
				...current,
				error: null,
				isPending: false,
				isReady: true,
			}));
			return;
		}

		setState((current) => ({
			...current,
			error: null,
			isPending: true,
		}));

		try {
			await authClient.signIn.anonymous({
				fetchOptions: {
					headers: {
						"x-captcha-response": token,
					},
				},
			});

			setState((current) => ({
				...current,
				error: null,
				isPending: false,
				isReady: true,
				needsSession: false,
			}));
		} catch {
			resetVerification(REJECTED_MESSAGE);
		}
	}

	const challenge = canRenderChallenge
		? {
				action: TURNSTILE_ACTION,
				siteKey: turnstileSiteKey,
				widgetKey,
				onError: () => resetVerification(RETRY_MESSAGE),
				onExpired: () => resetVerification(null),
				onToken: (token: string) => {
					void handleVerified(token);
				},
			}
		: null;

	return {
		challenge,
		error,
		handleRejected: () => {
			setState((current) => ({
				...current,
				error: REJECTED_MESSAGE,
				isPending: false,
				isReady: false,
				needsSession: true,
				widgetKey: current.widgetKey + 1,
			}));
		},
		isReady,
		isPending,
	};
}
