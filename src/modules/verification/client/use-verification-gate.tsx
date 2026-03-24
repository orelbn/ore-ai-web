"use client";

import { useEffectEvent, useState } from "react";
import { tryCatchAsync } from "@/lib/try-catch";
import { signIn, useSession } from "@/services/auth/client";

const RETRY_MESSAGE =
	"We couldn't get things ready right now. Please try again.";
const REJECTED_MESSAGE =
	"We couldn't keep your chat session active. Please verify and try again.";

export function useVerificationGate(onAccessGranted: () => void) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isCreatingSession, setIsCreatingSession] = useState(false);
	const [widgetKey, setWidgetKey] = useState(0);
	const grantAppAccess = useEffectEvent(onAccessGranted);
	const { data, refetch } = useSession();

	function reject() {
		setErrorMessage(REJECTED_MESSAGE);
		setIsCreatingSession(false);
		setWidgetKey((k) => k + 1);
	}

	async function handleTurnstileSuccess(token: string) {
		setErrorMessage(null);
		if (data) return grantAppAccess();

		setIsCreatingSession(true);

		const result = await tryCatchAsync(signIn.anonymous)({
			fetchOptions: { headers: { "x-captcha-response": token } },
		});

		if (result.error || result.data.error) return reject();

		setIsCreatingSession(false);
		await refetch();
		grantAppAccess();
	}

	return {
		errorMessage,
		isCreatingSession,
		widgetKey,
		turnstileProps: {
			options: { action: "session_access" },
			onError: () => setErrorMessage(RETRY_MESSAGE),
			onExpire: () => setErrorMessage(null),
			onSuccess: (token: string) => void handleTurnstileSuccess(token),
		},
	};
}
