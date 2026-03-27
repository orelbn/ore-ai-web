import babel from "@rolldown/plugin-babel";
import { cloudflare } from "@cloudflare/vite-plugin";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

const reactCompilerBabelOptions = {
  presets: [reactCompilerPreset()],
} satisfies Parameters<typeof babel>[0];

const toolIgnorePatterns = [
  ".agents/**",
  ".codex/**",
  ".prompts/**",
  ".vscode/**",
  "cloudflare-env.d.ts",
  "migrations/**",
  "skills-lock.json",
  "src/routeTree.gen.ts",
];

const isTestCommand = process.argv
  .slice(2)
  .some((arg) => ["test", "related", "run", "watch"].includes(arg));

const testConfig = cloudflareTest({
  wrangler: { configPath: "./wrangler.jsonc" },
});

const regularConfig = cloudflare({ viteEnvironment: { name: "ssr" } });
const cloudflarePlugin = isTestCommand ? testConfig : regularConfig;

export default defineConfig({
  fmt: {
    ignorePatterns: toolIgnorePatterns,
  },
  lint: {
    ignorePatterns: toolIgnorePatterns,
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  staged: {
    "*.{js,jsx,ts,tsx,mjs,cjs,css,json,md}": "vp check --fix",
    "*.{js,jsx,ts,tsx,mjs,cjs}": "vp test related",
  },
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    exclude: ["evals/tests/**"],
  },
  server: {
    port: 3000,
  },
  plugins: [
    cloudflarePlugin,
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel(reactCompilerBabelOptions),
  ],
});
