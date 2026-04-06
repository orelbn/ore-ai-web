# Development Guide

## Local Setup

```bash
vp install
cp wrangler.jsonc.example wrangler.jsonc
cp .dev.vars.example .dev.vars
vpr db:migrate:local
vp dev
```

Fill in the placeholders in `wrangler.jsonc` and `.dev.vars`.

## Commands

| Task                    | Command                |
| ----------------------- | ---------------------- |
| Install deps            | `vp install`           |
| Start dev server        | `vp dev`               |
| Run checks              | `vp check`             |
| Run tests               | `vp test`              |
| Build                   | `vp build`             |
| Run local DB migrations | `vpr db:migrate:local` |
| Validate staged files   | `vp staged`            |

## Runtime Notes

- The app is public by default. There is no sign-in flow and no server-side chat history.
- The current tab's conversation is stored in browser `sessionStorage`.
- Request context is trimmed by serialized size rather than raw message count.
- The first send requires Turnstile verification unless the browser already has a Better Auth anonymous session.
- Tests skip the Cloudflare Vite plugin and use mocked Worker bindings.

## Repo-Specific Config

- Local `vp dev` runs the sibling `../ore-ai-mcp` Worker as an auxiliary Worker and talks to it through the `ORE_AI_MCP` service binding by default.
- `ORE_AI_MCP_PATH` is optional. Set it only when your local MCP checkout is not at `../ore-ai-mcp` or when CI checks out the MCP repo into a different path.
- `MCP_SERVER_URL` is optional. Set it only when you want to override that default and target a different MCP server URL.
- `AGENT_PROMPT_KEY` is optional. If set, the app loads `AGENT_PROMPTS/<key>` from R2.

Example local MCP override:

```bash
ORE_AI_MCP_PATH=/absolute/path/to/ore-ai-mcp
```

Example MCP URL override:

```bash
MCP_SERVER_URL=http://localhost:8787/mcp
```

## Prompt Uploads

Prompt files live in `.prompts/`.

```bash
vpr prompt:upload -- --bucket your-agent-prompts-bucket-name
```

You can also pass `--source <file-or-folder>`. The script uploads markdown files to `prompts/*` in the target bucket.
