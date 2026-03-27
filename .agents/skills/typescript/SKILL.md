---
name: typescript
description: "Practical TypeScript defaults for application code: strong but simple typing, clear type modeling, consistent `type` vs `interface` choices, and keeping shared/exported types in nearby `types.ts` files. Use when writing or refactoring TypeScript and deciding how to model data, annotate boundaries, organize type definitions, or improve readability without adding type noise."
---

# TypeScript

Use these defaults when writing or refactoring TypeScript. Optimize for clarity, strong types, and low ceremony.

Reach for `deep-modules-typescript` instead when the task is about module boundaries, package structure, or architecture.

## Apply These Defaults

- Prefer `type` by default.
- Use `interface` only for extendable object contracts, class-facing contracts, or declaration merging.
- Choose the simplest type that preserves correctness.
- Prefer named reusable types over repeated inline object shapes.
- Prefer discriminated unions for stateful data.
- Use utility types such as `Pick`, `Omit`, and `Partial` instead of duplicating variants.
- Keep generics minimal and purposeful.
- Rely on inference for locals; annotate exported functions and important boundaries.
- Avoid `any`, unnecessary casts, and non-null assertions.

## Choose `type` Or `interface`

Use `type` for:

- most application code
- unions and intersections
- aliases
- tuples
- mapped or composed types

Use `interface` for:

- extendable object contracts
- class-facing contracts
- declaration merging

Default to `type` unless `interface` provides a clear benefit.

## Organize Types

Keep implementation files easy to scan.

Move types into a `types.ts` file at the same level as the feature when they are:

- shared across files
- exported
- more than a few lines
- making the implementation harder to read

Keep types inline only when they are small and local.

Preferred structure:

```text
thing/
  files
  types.ts
  index.ts
```

or:

```text
files
types.ts
```

Avoid large blocks of type declarations inside implementation files.

## Keep Types Useful

- Use discriminated unions to make state transitions explicit.
- Prefer reusable named types for public shapes and repeated data structures.
- Export types at module boundaries when they clarify inputs, outputs, or contracts.
- Let inference handle obvious locals instead of annotating everything.
- Stop before introducing clever type-level machinery that makes the code harder to change.

Types should improve clarity without dominating the code.
