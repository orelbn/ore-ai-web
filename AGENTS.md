# Agent Instructions

## Commits

Before making any commit, follow [.agents/skills/commit-conventions/SKILL.md](.agents/skills/commit-conventions/SKILL.md)

## Understanding project libraries

Before working with any library or dependency, follow the workflow defined in [.agents/skills/library-docs/SKILL.md](.agents/skills/library-docs/SKILL.md).

When a library's documented example or recommended integration pattern meets the project requirements, prefer the direct library pattern over custom wrappers, adapter layers, or local abstractions.

Do not add one-line wrapper helpers or pass-through functions unless they name a real domain concept or hide meaningful complexity.

## General React Engineering

For any React component/hook architecture, refactors, state ownership, or composition decisions across the app, use [.agents/skills/react-engineering/SKILL.md](.agents/skills/react-engineering/SKILL.md).

## Testing Discipline

For any task that adds, removes, reviews, or refactors tests, you must use [.agents/skills/unit-testing/SKILL.md](.agents/skills/unit-testing/SKILL.md).

Do not add or keep low-value tests. Remove tests that mainly restate config shape, verify trivial pass-through wrappers, or assert implementation details without protecting a meaningful behavioral contract.

Prefer behavior-focused tests that fail for real regressions and stay stable through harmless refactors.

<!-- intent-skills:start -->
# Skill mappings - when working in these areas, load the linked skill file into context.
skills:
	- task: "route access control and auth redirects in app routes"
		load: "node_modules/@tanstack/router-core/skills/router-core/auth-and-guards/SKILL.md"
	- task: "route loaders, preloading, and cached page data behavior"
		load: "node_modules/@tanstack/router-core/skills/router-core/data-loading/SKILL.md"
	- task: "navigation flows, links, and route transitions"
		load: "node_modules/@tanstack/router-core/skills/router-core/navigation/SKILL.md"
	- task: "api route handlers in src/routes/api and request/response handling"
		load: "node_modules/@tanstack/start-client-core/skills/start-core/server-routes/SKILL.md"
	- task: "client/server boundary decisions for shared modules and server logic"
		load: "node_modules/@tanstack/start-client-core/skills/start-core/execution-model/SKILL.md"
<!-- intent-skills:end -->
