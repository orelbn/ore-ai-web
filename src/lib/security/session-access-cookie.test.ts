import { describe, expect, test } from "vitest";
import {
	createSessionAccessCookie,
	hasValidSessionAccessCookie,
} from "./session-access-cookie";

describe("session access cookie", () => {
	test("creates and validates a signed cookie", async () => {
		const cookie = await createSessionAccessCookie("secret");
		const request = new Request("http://localhost", {
			headers: { cookie },
		});

		await expect(
			hasValidSessionAccessCookie({
				request,
				secret: "secret",
			}),
		).resolves.toBe(true);
	});

	test("rejects cookie signed with different secret", async () => {
		const cookie = await createSessionAccessCookie("secret-a");
		const request = new Request("http://localhost", {
			headers: { cookie },
		});

		await expect(
			hasValidSessionAccessCookie({
				request,
				secret: "secret-b",
			}),
		).resolves.toBe(false);
	});
});
