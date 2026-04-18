// Maintain a separate testing config until Vite+ and Cloudflare test integration improve.
import { fileURLToPath } from "node:url";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const srcPath = fileURLToPath(new URL("src/", import.meta.url));
const testServiceBindings = {
  ORE_AI_MCP() {
    return new Response("ok");
  },
};

export default defineConfig({
  plugins: [
    cloudflareTest({
      miniflare: {
        serviceBindings: testServiceBindings,
      },
      remoteBindings: false,
      wrangler: { configPath: "./wrangler.jsonc" },
    }),
  ],
  resolve: {
    alias: {
      "@": srcPath,
    },
  },
  test: {
    exclude: ["node_modules/**", ".git/**", "evals/tests/**", "tests/e2e/**"],
  },
});
