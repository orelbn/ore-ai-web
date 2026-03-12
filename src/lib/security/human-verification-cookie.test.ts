import { describe, expect, test } from "vitest";
import {
	createHumanVerificationCookie,
	hasValidHumanVerificationCookie,
} from "./human-verification-cookie";

describe("human verification cookie", () => {
	test("creates and validates a signed cookie", async () => {
		const cookie = await createHumanVerificationCookie("secret");
		const request = new Request("http://localhost", {
			headers: { cookie },
		});

		await expect(
			hasValidHumanVerificationCookie({
				request,
				secret: "secret",
			}),
		).resolves.toBe(true);
	});

	test("rejects cookie signed with different secret", async () => {
		const cookie = await createHumanVerificationCookie("secret-a");
		const request = new Request("http://localhost", {
			headers: { cookie },
		});

		await expect(
			hasValidHumanVerificationCookie({
				request,
				secret: "secret-b",
			}),
		).resolves.toBe(false);
	});
});
