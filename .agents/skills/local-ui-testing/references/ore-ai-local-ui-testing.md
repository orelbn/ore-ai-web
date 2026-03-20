# Ore AI Local UI Testing

## Local Runtime Facts

- Local app URL: `http://localhost:3000`
- Dev command: `bun dev`
- The app uses the Cloudflare Vite plugin and reads local worker config from `wrangler.jsonc` in the repo root.
- Local secrets are read from `.dev.vars` in the repo root.

## Turnstile

- The tracked `.dev.vars.example` already documents Cloudflare Turnstile local test keys:
  - `TURNSTILE_SITE_KEY=1x00000000000000000000AA`
  - `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`
- `TURNSTILE_SITE_KEY` lives in local `wrangler.jsonc`.
- `TURNSTILE_SECRET_KEY` lives in local `.dev.vars`.
- Cloudflare's Turnstile testing docs show dummy-key validations do not behave like production metadata checks, so local-only runs should use `localhost` and temporarily patch `src/modules/session/server/chat-access.ts` rather than weakening shared application verification logic.

## Session and Chat Constraints

- The first chat send requires short-lived session access unless the browser already has the `ore_ai_session` cookie.
- The verified-human cookie is HttpOnly.
- The current conversation is stored in browser `sessionStorage`.
- Session-bound assistant history can fail if the browser keeps old `sessionStorage` but the session cookie rotates.

## Practical Testing Implications

- Switching to Turnstile test keys is the normal first step for local browser testing.
- Reproducing session rotation may require a temporary local-only code hook because the cookie is HttpOnly and the normal TTL is 30 minutes.
- If port `3000` is already serving the app, prefer reusing that dev server instead of killing it.

## Local File Rules

- `wrangler.jsonc.example` is the tracked template and must not be edited for testing.
- `.dev.vars.example` is tracked reference material and must not be edited for testing.
- `wrangler.jsonc` and `.dev.vars` are local working files and may be temporarily swapped if they are restored exactly afterward.
