"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSessionAccessPublicConfig } from "../server/public-config";
import {
	SESSION_ACCESS_COOKIE_MAX_AGE_SECONDS,
	SESSION_ACCESS_TURNSTILE_ACTION,
} from "../constants";

const SESSION_UNAVAILABLE_MESSAGE =
	"We couldn't send your message right now. Please refresh and try again.";
const SESSION_PREPARING_MESSAGE =
	"We're getting things ready. Please try again in a moment.";
const SESSION_RETRY_MESSAGE =
	"We couldn't get things ready right now. Please try again.";

type SessionAccessState = {
	hasLoadedPublicConfig: boolean;
	turnstileSiteKey: string;
	hasSessionAccess: boolean;
	sessionAccessExpiresAt: number | null;
	turnstileToken: string | null;
	turnstileWidgetKey: number;
	error: string | null;
};

export function useSessionAccess() {
	const [state, setState] = useState<SessionAccessState>({
		hasLoadedPublicConfig: false,
		turnstileSiteKey: "",
		hasSessionAccess: false,
		sessionAccessExpiresAt: null,
		turnstileToken: null,
		turnstileWidgetKey: 0,
		error: null,
	});
	const stateRef = useRef(state);

	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	useEffect(() => {
		void getSessionAccessPublicConfig()
			.then((config) => {
				setState((current) => ({
					...current,
					hasLoadedPublicConfig: true,
					turnstileSiteKey: config.turnstileSiteKey,
					hasSessionAccess: config.hasSessionAccess,
					sessionAccessExpiresAt: config.hasSessionAccess
						? Date.now() + SESSION_ACCESS_COOKIE_MAX_AGE_SECONDS * 1000
						: null,
					error: current.error,
				}));
			})
			.catch(() => {
				setState((current) => ({
					...current,
					hasLoadedPublicConfig: true,
					error: SESSION_UNAVAILABLE_MESSAGE,
				}));
			});
	}, []);

	const hasFreshSessionAccess = useMemo(() => {
		if (!state.hasSessionAccess) {
			return false;
		}

		if (state.sessionAccessExpiresAt === null) {
			return true;
		}

		return state.sessionAccessExpiresAt > Date.now();
	}, [state.hasSessionAccess, state.sessionAccessExpiresAt]);

	const canSubmit =
		state.hasLoadedPublicConfig &&
		(hasFreshSessionAccess ||
			Boolean(state.turnstileToken) ||
			!state.turnstileSiteKey);

	function clearError() {
		setState((current) => {
			const nextState = { ...current, error: null };
			stateRef.current = nextState;
			return nextState;
		});
	}

	function resetTurnstileWidget(nextError: string | null = null) {
		setState((current) => {
			const nextState = {
				...current,
				hasSessionAccess: false,
				sessionAccessExpiresAt: null,
				turnstileToken: null,
				turnstileWidgetKey: current.turnstileWidgetKey + 1,
				error: nextError,
			};
			stateRef.current = nextState;
			return nextState;
		});
	}

	function markSessionAccessActive() {
		setState((current) => {
			const nextState = {
				...current,
				hasSessionAccess: true,
				sessionAccessExpiresAt:
					Date.now() + SESSION_ACCESS_COOKIE_MAX_AGE_SECONDS * 1000,
				turnstileToken: null,
				error: null,
			};
			stateRef.current = nextState;
			return nextState;
		});
	}

	function handleTurnstileToken(token: string) {
		setState((current) => {
			const nextState = {
				...current,
				turnstileToken: token,
				error: null,
			};
			stateRef.current = nextState;
			return nextState;
		});
	}

	function handleTurnstileError() {
		resetTurnstileWidget(SESSION_RETRY_MESSAGE);
	}

	function handleTurnstileExpired() {
		resetTurnstileWidget(null);
	}

	async function ensureSessionAccess(): Promise<boolean> {
		const currentState = stateRef.current;
		const currentHasFreshSessionAccess =
			currentState.hasSessionAccess &&
			(currentState.sessionAccessExpiresAt === null ||
				currentState.sessionAccessExpiresAt > Date.now());

		if (currentHasFreshSessionAccess) {
			return true;
		}

		if (!currentState.hasLoadedPublicConfig || !currentState.turnstileSiteKey) {
			setState((current) => ({
				...current,
				error: SESSION_UNAVAILABLE_MESSAGE,
			}));
			return false;
		}

		if (!currentState.turnstileToken) {
			setState((current) => ({
				...current,
				error: SESSION_PREPARING_MESSAGE,
			}));
			return false;
		}

		const response = await fetch("/api/session/verify", {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({ token: currentState.turnstileToken }),
			credentials: "same-origin",
		});

		if (!response.ok) {
			resetTurnstileWidget(SESSION_RETRY_MESSAGE);
			return false;
		}

		markSessionAccessActive();
		return true;
	}

	return {
		canSubmit,
		error: state.error,
		turnstileSiteKey: state.turnstileSiteKey,
		turnstileWidgetKey: state.turnstileWidgetKey,
		turnstileAction: SESSION_ACCESS_TURNSTILE_ACTION,
		hasFreshSessionAccess,
		clearError,
		ensureSessionAccess,
		handleSessionAccessRejected: () => {
			resetTurnstileWidget(null);
		},
		handleTurnstileExpired,
		handleTurnstileError,
		handleTurnstileToken,
	};
}
