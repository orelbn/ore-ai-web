import { defineConfig } from "vite-plus";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["evals/tests/**/*.test.ts"],
    exclude: [],
    testTimeout: 30000,
  },
});
