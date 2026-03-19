import { describe, expect, test } from "vitest";
import { buildOreAuthOptions, ORE_AUTH_COOKIE_NAMES } from "./config";

describe("buildOreAuthOptions", () => {
	test("should preserve Ore cookie names and anonymous auth when building auth options", () => {
		const options = buildOreAuthOptions({
			DB: {} as D1Database,
			BETTER_AUTH_SECRET: " secret ",
			BETTER_AUTH_URL: " https://oreai.orelbn.ca ",
		});

		expect(options.secret).toBe("secret");
		expect(options.baseURL).toBe("https://oreai.orelbn.ca");
		expect(options.advanced?.cookies?.session_token?.name).toBe(
			ORE_AUTH_COOKIE_NAMES.sessionToken,
		);
		expect(options.advanced?.cookies?.session_data?.name).toBe(
			ORE_AUTH_COOKIE_NAMES.sessionData,
		);
		expect(options.advanced?.cookies?.dont_remember?.name).toBe(
			ORE_AUTH_COOKIE_NAMES.dontRemember,
		);
		expect(options.plugins?.map((plugin) => plugin.id)).toContain("anonymous");
	});
});
