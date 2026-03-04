import { describe, expect, test } from "bun:test";
import { tryCatch } from "./try-catch";

describe("tryCatch", () => {
	test("returns data for resolved promises", async () => {
		const result = await tryCatch(Promise.resolve(42));

		expect(result.error).toBeNull();
		if (result.error === null) {
			expect(result.data).toBe(42);
		}
	});

	test("returns error for rejected promises", async () => {
		const result = await tryCatch(Promise.reject(new Error("boom")));

		expect(result.data).toBeNull();
		expect(result.error).toBeInstanceOf(Error);
	});
});
