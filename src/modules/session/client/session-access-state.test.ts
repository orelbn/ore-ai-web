import { describe, expect, test } from "vitest";
import {
	activateSessionAccess,
	canSubmitWithSessionAccess,
	resetSessionAccessTurnstile,
	SESSION_UNAVAILABLE_MESSAGE,
	type SessionAccessState,
	storeTurnstileToken,
} from "./session-access-state";

function createState(
	overrides: Partial<SessionAccessState> = {},
): SessionAccessState {
	return {
		turnstileSiteKey: "site-key",
		hasSessionAccess: false,
		sessionBindingId: null,
		turnstileToken: null,
		turnstileWidgetKey: 0,
		error: null,
		...overrides,
	};
}

describe("session access state", () => {
	test("should keep submit disabled until verification succeeds", () => {
		expect(canSubmitWithSessionAccess(createState())).toBe(false);
		expect(
			canSubmitWithSessionAccess(
				createState({
					turnstileToken: "token-1",
				}),
			),
		).toBe(true);
	});

	test("should keep submit enabled after chat access becomes active", () => {
		expect(
			canSubmitWithSessionAccess(
				createState({
					hasSessionAccess: true,
					sessionBindingId: "binding-1",
				}),
			),
		).toBe(true);
	});

	test("should fail closed when activation is attempted without a binding id", () => {
		const nextState = activateSessionAccess(createState(), null);

		expect(nextState).toMatchObject({
			hasSessionAccess: false,
			sessionBindingId: null,
			error: SESSION_UNAVAILABLE_MESSAGE,
		});
	});

	test("should relock chat and increment the widget key when the turnstile resets", () => {
		const nextState = resetSessionAccessTurnstile(
			storeTurnstileToken(
				createState({
					hasSessionAccess: true,
					sessionBindingId: "binding-1",
					turnstileWidgetKey: 2,
				}),
				"token-1",
			),
			"retry",
		);

		expect(nextState).toMatchObject({
			hasSessionAccess: false,
			sessionBindingId: null,
			turnstileToken: null,
			turnstileWidgetKey: 3,
			error: "retry",
		});
	});
});
