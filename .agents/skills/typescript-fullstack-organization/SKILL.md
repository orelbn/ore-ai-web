---
name: typescript-fullstack-organization
description: Organize or refactor modern TypeScript fullstack applications around module-first boundaries with small readable files, explicit public exports, high cohesion, low coupling, and deliberate placement of shared code and third-party services. Use when designing folder structure, splitting oversized routes or components, separating UI from validation/business logic/data access, deciding where shared code should live, or defining a module's public API.
---

# TypeScript Fullstack Organization

Organize the codebase by module first. Keep route files thin, keep UI focused on rendering and interaction, and move non-trivial behavior into module-owned logic and data access layers.

## Working Style

Apply these defaults unless the existing project structure gives a strong reason not to:

- Group code by module or domain, not by global technical layer.
- Keep files and folders small, focused, and easy to scan.
- Separate route entry, UI, validation, business logic, and data access.
- Prefer folder context over repetitive file names.
- Share code only when reuse preserves high cohesion and low coupling.
- Start with a file; split into a folder when complexity earns it.
- Put third-party integrations under `services/`; keep service setup, adapters, and tests there.

## Default Structure

Use this as the baseline layout for a TypeScript fullstack app:

```txt
src/
  routes/
    files...
  modules/
    <module>/
      components/
      schema.ts
      logic/
      repo/
      types.ts
      errors.ts
      index.ts
  components/
    ui/
    layout/
  services/
    <service>/
      files...
  lib/
    auth/
    http/
    env/
    utils/
  config/
  styles/

tests/
  integration/
  e2e/
```

Treat this as guidance, not ceremony. Any concern may remain a single file until growth or complexity justifies turning it into a folder.

## Place Code Deliberately

Use these placement rules:

- `routes/`: route entry, route wiring, loaders, actions, mutations, and page composition
- `modules/<module>/components/`: module-owned UI
- `modules/<module>/schema.ts` or `schema/`: validation and parsing
- `modules/<module>/logic/`: business logic and orchestration
- `modules/<module>/repo/`: persistence and server-side data access only
- `modules/<module>/types.ts` or `types/`: module-local types
- `modules/<module>/errors.ts` or `errors/`: explicit failures
- `modules/<module>/index.ts`: module public API only
- `components/ui/` and `components/layout/`: shared UI patterns not owned by one module
- `services/<service>/`: third-party integration setup, adapters, and service-specific tests
- `lib/`: shared primitives and infrastructure, not application workflows

Use `modules/` for owned workflows and application behavior. Use `lib/` for cross-module primitives. Do not turn `lib/`, `types/`, `hooks/`, or `utils/` into dumping grounds.

## Refactoring Workflow

When reorganizing an existing feature, work in this order:

1. Identify the module or domain boundary first.
2. Keep the route or page entry thin; move non-trivial behavior out.
3. Split the feature into UI, schema, logic, repo, types, and errors only as needed.
4. Keep module-specific helpers inside the module unless they are reused, stable, truly cross-module, and clearer when shared.
5. Add or tighten `index.ts` so other modules depend only on the intended public API.
6. Place tests by scope: colocate unit tests, keep multi-module integration and e2e coverage under `tests/`.

If a file grows hard to scan, split by responsibility rather than by arbitrary suffixes.

## Scaling Pattern

When a concern grows, split it into folders like this:

```txt
modules/account/
  components/
    profile-form.tsx
    account-panel.tsx
  schema/
    update-profile.ts
    shared.ts
  logic/
    get-account.ts
    update-profile.ts
    delete-account.ts
  repo/
    get-account.ts
    update-account.ts
  types/
    api.ts
    model.ts
    view.ts
  errors/
    account-not-found.ts
  index.ts
```

Prefer one file with one main job. Prefer one folder with one clear responsibility.

## Public API Rules

Use a module-level `index.ts` to define the public surface.

Export only what other modules should rely on:

- public components
- public types
- public logic
- stable constants

Do not export private helpers or internal implementation details. Avoid giant barrel chains that hide ownership or make imports ambiguous.

## Readability Rules

Keep these habits:

- one file, one main job
- one folder, one clear responsibility
- keep route files thin
- keep components focused on rendering and interaction
- move non-trivial logic out of components
- place the main export near the top
- keep helpers below
- prefer explicit names over clever abstractions
- comment non-obvious reasoning only

## Testing Placement

Place tests by the behavior they validate:

- colocate unit tests with functionality using `.test.ts`
- keep integration and e2e tests involving more than one module under `tests/`
- mirror source structure in tests when that makes navigation easier
- use `.spec.ts` for e2e coverage

## Anti-Patterns

Avoid these patterns:

- global layer folders for the whole app
- giant page or route files
- giant components that mix rendering, fetching, and mutations
- unrelated code dumped into `utils/`
- UI, validation, business logic, and persistence mixed in one file
- abstractions created before the code earns them
