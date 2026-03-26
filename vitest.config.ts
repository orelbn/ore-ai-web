import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: "./wrangler.jsonc" },
		}),
	],
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tests/**/*.test.ts"],
		// Keep behavior deterministic while we reduce global/module mock usage.
		fileParallelism: false,
		clearMocks: true,
		restoreMocks: true,
		mockReset: true,
	},
});
