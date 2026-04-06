import { existsSync } from "node:fs";
import { resolve } from "node:path";
import babel from "@rolldown/plugin-babel";
import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

const reactCompilerBabelOptions = {
  presets: [reactCompilerPreset()],
} satisfies Parameters<typeof babel>[0];

const auxiliaryWorkerRoot =
  process.env.ORE_AI_MCP_PATH ?? resolve(import.meta.dirname, "../ore-ai-mcp");
const auxiliaryWorkerConfigPath = resolve(auxiliaryWorkerRoot, "wrangler.jsonc");
const auxiliaryWorkers = existsSync(auxiliaryWorkerConfigPath)
  ? [{ configPath: auxiliaryWorkerConfigPath }]
  : undefined;

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
    pool: "threads",
    exclude: ["node_modules/**", ".git/**", "evals/tests/**"],
  },
  server: {
    port: 3000,
  },
  plugins: [
    // Skip the Cloudflare plugin during tests; Worker bindings are mocked.
    ...(!isTestCommand
      ? [
          cloudflare({
            viteEnvironment: { name: "ssr" },
            inspectorPort: false,
            auxiliaryWorkers,
          }),
        ]
      : []),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel(reactCompilerBabelOptions),
  ],
});
