import { defineConfig } from "vite-plus";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    exclude: [],
    include: ["evals/tests/**/*.test.ts"],
    testTimeout: 30000,
  },
});
