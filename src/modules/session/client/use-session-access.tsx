"use client";

import { useCallback, useMemo, useState } from "react";
import { SESSION_ACCESS_TURNSTILE_ACTION } from "../constants";
import {
	activateSessionAccess,
	canSubmitWithSessionAccess,
	clearSessionAccessError,
	resetSessionAccessTurnstile,
	SESSION_RETRY_MESSAGE,
	type SessionAccessState,
	storeTurnstileToken,
} from "./session-access-state";

export function useSessionAccess(turnstileSiteKey: string) {
	const [state, setState] = useState<SessionAccessState>({
		turnstileSiteKey,
		hasSessionAccess: false,
		sessionBindingId: null,
		turnstileToken: null,
		turnstileWidgetKey: 0,
		error: null,
	});

	const updateState = useCallback(
		(updater: (current: SessionAccessState) => SessionAccessState) => {
			setState((current) => updater(current));
		},
		[],
	);

	const canSubmit = useMemo(() => {
		return canSubmitWithSessionAccess(state);
	}, [state]);

	function clearError() {
		updateState(clearSessionAccessError);
	}

	function resetTurnstileWidget(nextError: string | null = null) {
		updateState((current) => resetSessionAccessTurnstile(current, nextError));
	}

	function markSessionAccessActive(sessionBindingId: string | null) {
		updateState((current) => activateSessionAccess(current, sessionBindingId));
	}

	function handleTurnstileToken(token: string) {
		updateState((current) => storeTurnstileToken(current, token));
	}

	function handleTurnstileError() {
		resetTurnstileWidget(SESSION_RETRY_MESSAGE);
	}

	function handleTurnstileExpired() {
		resetTurnstileWidget(null);
	}

	return {
		canSubmit,
		error: state.error,
		sessionBindingId: state.sessionBindingId,
		turnstileSiteKey: state.turnstileSiteKey,
		turnstileToken: state.turnstileToken,
		turnstileWidgetKey: state.turnstileWidgetKey,
		turnstileAction: SESSION_ACCESS_TURNSTILE_ACTION,
		clearError,
		markSessionAccessActive,
		handleSessionAccessRejected: () => {
			resetTurnstileWidget(
				"We couldn't keep your chat session active. Please verify and try again.",
			);
		},
		handleTurnstileExpired,
		handleTurnstileError,
		handleTurnstileToken,
	};
}
