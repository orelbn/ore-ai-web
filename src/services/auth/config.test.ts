import { describe, expect, test } from "vitest";
import { buildOreAuthOptions, ORE_AUTH_COOKIE_NAMES } from "./config";

describe("buildOreAuthOptions", () => {
	test("should wire Better Auth to D1 with Ore cookie names and anonymous auth", () => {
		const database = {} as D1Database;
		const options = buildOreAuthOptions({
			AUTH_DB: database,
			BETTER_AUTH_SECRET: " secret ",
			BETTER_AUTH_URL: " https://oreai.orelbn.ca ",
		});

		expect(options.database).toBe(database);
		expect(options.secret).toBe("secret");
		expect(options.baseURL).toBe("https://oreai.orelbn.ca");
		expect(options.user?.modelName).toBe("users");
		expect(options.session?.modelName).toBe("sessions");
		expect(options.account?.modelName).toBe("accounts");
		expect(options.verification?.modelName).toBe("verifications");
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
