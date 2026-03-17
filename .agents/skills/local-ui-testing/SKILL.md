---
name: local-ui-testing
description: Safely run local browser testing for the Ore AI app by temporarily preparing local testing config, exercising the app with agent-browser, and restoring the workspace afterward. Use when asked to locally smoke-test the app, verify browser behavior against a local dev server, temporarily switch to Cloudflare Turnstile test keys, reproduce session-access or chat flows in the browser, or make and then revert narrow local-only testing changes.
allowed-tools: Bash(agent-browser:*), Bash(npx agent-browser:*), Bash(bun:*), Bash(python3:*), Bash(lsof:*), Bash(curl:*)
---

# Local UI Testing

Run browser testing against the local Ore AI app without leaving lasting local config changes behind.

## Workflow

1. Run the preflight checks:
   - confirm `agent-browser`, `bun`, and `python3` are installed
   - confirm the repo root contains `wrangler.jsonc.example` and `.dev.vars.example`
   - inspect `git status --short` and treat existing user changes as untouchable
2. Prepare local test config with `scripts/prepare_local_ui_test_env.py`.
3. Run the local browser test:
   - prefer `scripts/run_local_ui_smoke.sh` for a basic smoke run
   - for scenario-specific flows, run `agent-browser` commands manually after prepare completes
4. Restore local state with `scripts/restore_local_ui_test_env.py`.
5. Verify cleanup succeeded before finishing.

## Guardrails

- Prefer temporary local config swaps over code changes.
- Never edit tracked template files such as `wrangler.jsonc.example` or `.dev.vars.example`.
- Never use destructive git commands for cleanup.
- If a local test truly requires a temporary code change, back up the exact file bytes first and restore from those backups only.
- Do not print secret values from `.dev.vars` or backup files.
- Close the `agent-browser` session when finished.

## Scripts

### `scripts/prepare_local_ui_test_env.py`

Run this first.

```bash
python3 .agents/skills/local-ui-testing/scripts/prepare_local_ui_test_env.py
```

It will:
- back up local `wrangler.jsonc` and `.dev.vars` if they exist
- create temporary local testing versions
- force Cloudflare Turnstile local test keys
- preserve unrelated local settings when possible
- print a JSON object containing the manifest path

### `scripts/run_local_ui_smoke.sh`

Use this for a quick smoke pass.

```bash
.agents/skills/local-ui-testing/scripts/run_local_ui_smoke.sh
```

It will:
- prepare local test config
- reuse an existing dev server on port `3000`
- open `http://localhost:3000`
- capture an initial snapshot, screenshot, and page text
- always restore config on exit

Pass `--keep-artifacts` to keep the temp run directory path in the final output.
Pass `--start-dev-server` only when you explicitly want the wrapper to boot `bun dev` for you.

### `scripts/restore_local_ui_test_env.py`

Use this if a run is interrupted or if you prepared config manually.

```bash
python3 .agents/skills/local-ui-testing/scripts/restore_local_ui_test_env.py --manifest /path/to/manifest.json
```

## Scenario-Specific Browser Testing

After prepare completes, prefer starting `bun dev` in a dedicated shell session yourself when port `3000` is not already in use. Then use the standard `agent-browser` workflow:

```bash
agent-browser --session ore-ai-local-ui open http://localhost:3000
agent-browser --session ore-ai-local-ui wait --load networkidle
agent-browser --session ore-ai-local-ui snapshot -i
```

Re-snapshot after each UI change. Save screenshots when a failure is visual or stateful.

## Temporary Local-Only Code Changes

Use this only when config swaps are insufficient, such as forcing a session-cookie rotation path.

1. Record the target file list before editing.
2. Copy exact original bytes for each touched file into the same temp run directory used by prepare.
3. Make the narrowest local-only change possible.
4. Run the browser test.
5. Restore those exact bytes before finishing.

For this repo, prefer temporarily patching `src/modules/session/server/verification.ts` to skip Turnstile action and hostname matching during local-only runs with Cloudflare's official dummy keys.

Never rely on `git checkout`, `git restore`, or `git reset` for this workflow.

## Reference

Read `references/ore-ai-local-ui-testing.md` when you need repo-specific local testing constraints, current local URL, or the app’s session/Turnstile behavior.
