export const SESSION_UNAVAILABLE_MESSAGE =
	"We couldn't send your message right now. Please refresh and try again.";
export const SESSION_RETRY_MESSAGE =
	"We couldn't get things ready right now. Please try again.";

export type SessionAccessState = {
	turnstileSiteKey: string;
	hasSessionAccess: boolean;
	sessionBindingId: string | null;
	turnstileToken: string | null;
	turnstileWidgetKey: number;
	error: string | null;
};

export function canSubmitWithSessionAccess(
	state: Pick<
		SessionAccessState,
		"turnstileSiteKey" | "hasSessionAccess" | "turnstileToken"
	>,
): boolean {
	return (
		Boolean(state.turnstileSiteKey) &&
		(state.hasSessionAccess || Boolean(state.turnstileToken))
	);
}

export function clearSessionAccessError(
	current: SessionAccessState,
): SessionAccessState {
	return {
		...current,
		error: null,
	};
}

export function resetSessionAccessTurnstile(
	current: SessionAccessState,
	nextError: string | null = null,
): SessionAccessState {
	return {
		...current,
		hasSessionAccess: false,
		sessionBindingId: null,
		turnstileToken: null,
		turnstileWidgetKey: current.turnstileWidgetKey + 1,
		error: nextError,
	};
}

export function activateSessionAccess(
	current: SessionAccessState,
	sessionBindingId: string | null,
): SessionAccessState {
	return {
		...current,
		hasSessionAccess: Boolean(sessionBindingId),
		sessionBindingId,
		turnstileToken: null,
		error: sessionBindingId ? null : SESSION_UNAVAILABLE_MESSAGE,
	};
}

export function storeTurnstileToken(
	current: SessionAccessState,
	token: string,
): SessionAccessState {
	return {
		...current,
		turnstileToken: token,
		error: null,
	};
}
