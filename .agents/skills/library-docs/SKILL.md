---
name: library-docs
description: Use this skill when a task depends on a library or dependency and you need reliable documentation or API context. Prefer project instructions, repo-local skills, global skills, installed docs, source, and types first. Use remote docs only when local material is not enough to complete the task safely.
---

# Purpose
Get the minimum library context needed to do the work safely.

# Use when
- A task depends on a library, package, framework, or external API shape.
- You need a method name, option, config field, type, or behavior detail.
- The repo may already include guidance or installed source for that dependency.
- Repo or global skills may already cover the dependency.

# Do not use when
- Repo conventions or existing feature patterns are enough.
- A local skill already answers the question.
- The task does not depend on library-specific behavior.

# Workflow
1. Identify the exact library and the exact question.
2. Check repo-local guidance first.
3. Check installed docs, source, and types next.
4. Use remote docs only if local material is still not enough.
5. Stop as soon as one source is sufficient.

# Local-first order
- Check `AGENTS.md`.
- Check repo skills and global skills that already cover the library or framework.
- Check docs bundled in `node_modules`.
- Check source and type definitions in `node_modules`.
- Check repo-maintained references such as `.agents/reference/libraries/registry.md`.

# Rules
- Prefer local material over remote retrieval.
- Do not use remote docs just because a library is mentioned.
- Do not use remote docs when the installed source already answers the question.
- Ask one narrow question at a time.
- Reuse context already gathered in the current session.
- Prefer the source closest to the code that is actually installed in the repo.

# Remote fallback
- Use MCP docs if they are available and local material is not enough.
- Use a verified official `llms.txt` from `.agents/reference/libraries/registry.md` when available.
- Use Context7 only when local sources, repo references, and better remote sources still do not provide enough context.
- If you verify a new official `llms.txt`, add it to `.agents/reference/libraries/registry.md`.

# Failure handling
- If local and remote sources still do not answer the question, say that clearly.
- If sources disagree, prefer the one closest to the installed version and note the conflict.

# Examples
- Use when: "Check the current options for this AI SDK call in this repo."
- Use when: "Confirm the right config field for this dependency."
- Do not use when: "Refactor this component to match our existing patterns."
- Do not use when: "Explain how this feature is organized in this codebase."
