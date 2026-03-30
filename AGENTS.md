# Agent Instructions

## Package Manager

- Use `bun install` for dependencies.
- Use Vite+: `vp dev`, `vp build`, `vp check`, `vp test`.
- Use `vp test` for the full test suite.
- The full suite intentionally skips the Cloudflare Vite test integration and uses explicit mocks for Worker bindings, which keeps Vite+ test runs fast and warning-free.

## File-Scoped Commands

| Task  | Command                            |
| ----- | ---------------------------------- |
| Check | `vp check path/to/file.ts`         |
| Lint  | `vp lint path/to/file.ts`          |
| Test  | `vp test run path/to/file.test.ts` |

## Commit Attribution

- Follow [.agents/skills/commit-conventions/SKILL.md](.agents/skills/commit-conventions/SKILL.md).
- Use Conventional Commits.

## Key Conventions

- For library or dependency work, follow [.agents/skills/library-docs/SKILL.md](.agents/skills/library-docs/SKILL.md).
- Prefer documented library patterns over local wrappers or pass-through helpers unless they hide real complexity or express a domain concept.
- For React architecture work, follow [.agents/skills/react-engineering/SKILL.md](.agents/skills/react-engineering/SKILL.md).
- For test work, follow [.agents/skills/testing-guidelines/SKILL.md](.agents/skills/testing-guidelines/SKILL.md).
- For Cloudflare integration testing, use [/Users/orelbn/.agents/skills/cloudflare/references/miniflare/README.md](/Users/orelbn/.agents/skills/cloudflare/references/miniflare/README.md).
- Remove low-value tests; prefer behavior and regression coverage.
- Use `satisfies` instead of `as`; use `zod` for runtime validation; prefer AI SDK provider types.
- For AI SDK work, follow [.agents/skills/ai-sdk/SKILL.md](.agents/skills/ai-sdk/SKILL.md).
- When spawning a subagent, use the best available model with `medium` reasoning.

<!-- intent-skills:start -->

# Skill mappings - when working in these areas, load the linked skill file into context.

skills: - task: "route access control and auth redirects in app routes"
load: "node_modules/@tanstack/router-core/skills/router-core/auth-and-guards/SKILL.md" - task: "route loaders, preloading, and cached page data behavior"
load: "node_modules/@tanstack/router-core/skills/router-core/data-loading/SKILL.md" - task: "navigation flows, links, and route transitions"
load: "node_modules/@tanstack/router-core/skills/router-core/navigation/SKILL.md" - task: "api route handlers in src/routes/api and request/response handling"
load: "node_modules/@tanstack/start-client-core/skills/start-core/server-routes/SKILL.md" - task: "client/server boundary decisions for shared modules and server logic"
load: "node_modules/@tanstack/start-client-core/skills/start-core/execution-model/SKILL.md"

<!-- intent-skills:end -->
