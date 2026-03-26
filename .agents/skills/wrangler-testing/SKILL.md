---
name: wrangler-testing
description: Use for any tests involving Cloudflare behavior, bindings, Wrangler, or `cloudflare:*` APIs, especially when code runs differently in Node versus the Cloudflare runtime.
---

# Wrangler Testing

## Overview

Prefer the real Workers runtime over local shims whenever the code under test touches Worker bindings, runtime APIs, or `cloudflare:*` modules.

If Cloudflare is materially involved in the behavior being tested, use this skill.

When you need Cloudflare's current testing guidance or API details, start from the Vitest integration landing page:
https://developers.cloudflare.com/workers/testing/vitest-integration/

## Test Design Rules

- Prefer tests that exercise real Worker behavior and bindings over tests that only restate mocks.
- Use `cloudflare:test` helpers when calling handlers directly, especially when `waitUntil()` side effects matter.
- Mock external services, not the Worker runtime itself.
- Treat Node-only passing behavior as suspicious when production runs on Cloudflare.

## Common Repairs

- Remove Node-only `cloudflare:workers` aliases and hand-written `env` shims when the official runtime should provide them.
- Fix tests that depend on Node scheduling quirks, especially unhandled rejection timing.
- Check binding mismatches first when D1/R2/KV/service-binding tests behave unexpectedly.
- Add test-only bindings through test runtime configuration instead of mutating app code.

## Failure Triage

- If a test fails only in the Workers runtime, look for unhandled rejections, missing `waitUntil()` flushing, Node-specific assumptions, or wrong binding config.
- If typing fails around `cloudflare:test` or `cloudflare:workers`, check the test TypeScript config and generated Wrangler env types.
- If a test passes with stubs but fails in real runtime, trust the real runtime first.
