# Development Guide

## Local Setup

Prerequisites:

- Bun
- A Cloudflare account authenticated with Wrangler
- A local `wrangler.jsonc` copied from `wrangler.jsonc.example`
- A local `.dev.vars` copied from `.dev.vars.example`
- A configured sibling `../ore-ai-mcp/wrangler.jsonc` for the local auxiliary MCP worker

```bash
bun install
cp wrangler.jsonc.example wrangler.jsonc
cp .dev.vars.example .dev.vars
vp run db:migrate:local
vp dev
```

Then fill in the placeholders in `wrangler.jsonc` and `.dev.vars`.

Validation and day-to-day commands now go through Vite+:

```bash
vp check
vp test
vp build
```

Temporary test runner note:

- Use `vp test` for the full suite.
- During tests, this repo skips the Cloudflare Vite plugin and relies on explicit mocks for Worker bindings instead. That keeps Vite+ test runs fast and avoids Cloudflare worker-pool compatibility noise.
- `vp run test` remains available through the root script if you want the package-script path.

This repo intentionally keeps `bun install` for dependency installation. `vp install` is not part of the Bun workflow here.

For staged-file validation, use:

```bash
vp staged
```

The staged config runs `vp check --fix` on staged source/docs files and `vp test related` for staged code files.

Most required values are already discoverable in:

- `.dev.vars.example`
- `wrangler.jsonc.example`
- `package.json`

## Runtime Notes

- The app is public by default. There is no sign-in flow and no server-side chat history.
- The current tab's conversation is stored in browser `sessionStorage`.
- Request context is trimmed by serialized size rather than raw message count.
- The first send requires Turnstile verification unless the browser already has a Better Auth anonymous session.

## Repo-Specific Config

- `AGENT_PROMPT_KEY` is optional. If set, the app loads `AGENT_PROMPTS/<key>` from R2; otherwise it falls back to the built-in prompt.
- Local `vp dev` runs the sibling `../ore-ai-mcp` Worker as an auxiliary Worker and talks to it through the `ORE_AI_MCP` service binding by default.
- `MCP_SERVER_URL` is optional. Set it only when you want to override that default and target a different MCP server URL.

Example local MCP override:

```bash
MCP_SERVER_URL=http://localhost:8787/mcp
```

## Prompt Uploads

Prompt files live in `.prompts/`.

```bash
vp run prompt:upload -- --bucket your-agent-prompts-bucket-name
```

You can also pass `--source <file-or-folder>`. The script uploads markdown files to `prompts/*` in the target bucket.
