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

const mcpWorkerRoot = resolve(import.meta.dirname, "../ore-ai-mcp");
const mcpWorkerCfgPath = resolve(mcpWorkerRoot, "wrangler.jsonc");
const auxiliaryWorkers = existsSync(mcpWorkerCfgPath)
  ? [{ configPath: mcpWorkerCfgPath }]
  : undefined;

const ignorePatterns = [
  ".agents/**",
  ".codex/**",
  ".prompts/**",
  ".vscode/**",
  "cloudflare-env.d.ts",
  "migrations/**",
  "ore-ai-mcp/**",
  "skills-lock.json",
  "src/routeTree.gen.ts",
];

export default defineConfig({
  fmt: {
    ignorePatterns,
  },
  lint: {
    ignorePatterns,
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  plugins: [
    cloudflare({
      auxiliaryWorkers,
      inspectorPort: false,
      viteEnvironment: { name: "ssr" },
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel(reactCompilerBabelOptions),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  staged: {
    "*.{js,jsx,ts,tsx,mjs,cjs,css,json,md}": "vp check --fix",
    "*.{js,jsx,ts,tsx,mjs,cjs}": "vpr test related --passWithNoTests",
  },
});
