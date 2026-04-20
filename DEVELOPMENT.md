# Development Guide

## Local Setup

```bash
vp install
cp wrangler.jsonc.example wrangler.jsonc
cp .dev.vars.example .dev.vars
vpr db:migrate:local
vp dev
```

## Commands

| Task                    | Command                |
| ----------------------- | ---------------------- |
| Install deps            | `vp install`           |
| Start dev server        | `vp dev`               |
| Run checks              | `vp check`             |
| Run tests once          | `vpr test run`         |
| Run tests in watch mode | `vpr test`             |
| Run browser E2E         | `vpr test:e2e`         |
| Build                   | `vp build`             |
| Run local DB migrations | `vpr db:migrate:local` |
| Validate staged files   | `vp staged`            |

## Notes

- Local `vp dev` runs the sibling `../ore-ai-mcp` Worker as an auxiliary Worker and talks to it through the `ORE_AI_MCP` service binding by default.
- If local `vp dev` logs `missing_context_index`, run `vpr mcp:context:sync` before restarting the dev server.

## Overrides

- `AGENT_PROMPT_KEY` loads the agent prompt from `AGENT_PROMPTS/<key>` in R2.

## Prompt Uploads

Prompt files live in `.prompts/`.

```bash
vpr prompt:upload -- --bucket your-agent-prompts-bucket-name
```
