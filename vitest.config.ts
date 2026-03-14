import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
		alias: {
			"cloudflare:workers": fileURLToPath(
				new URL("./tests/support/cloudflare-workers.ts", import.meta.url),
			),
		},
	},
	test: {
		environment: "node",
		include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tests/**/*.test.ts"],
		// Keep behavior deterministic while we reduce global/module mock usage.
		fileParallelism: false,
		clearMocks: true,
		restoreMocks: true,
		mockReset: true,
	},
});
