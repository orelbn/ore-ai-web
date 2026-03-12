---
name: unit-testing
description: Methodology for writing high-quality, behavior-focused unit tests that provide strong regression detection and remain maintainable over time. Use when asked to add or improve unit tests, reduce flaky tests, strengthen weak assertions, review mocking strategy, or verify behavior without coupling tests to implementation details.
---

# Unit Testing Skill

## Goal
Write unit tests that protect behavioral contracts, fail for meaningful regressions, and remain stable during harmless refactors.

## Required Output Before Writing Tests
Always produce these three temporary test artifacts before writing tests. Once testing is completed please remove the artifacts.

### 1) SUT + Contract Summary
- **SUT (System Under Test):** The exact function, class, hook, or module being tested.
- **Behavioral contract(s):** The rules the SUT must satisfy.
- **Observable outcomes:** Outputs, state changes, events, errors, or side effects that represent the contract.
- **Failure meaning:** What a failing test implies about broken behavior.

### 2) Case Matrix
Design a compact set of high-signal cases.

| Case type | Rule verified | Input shape | Expected observable outcome | Why it matters |
|---|---|---|---|---|
| Happy path |  |  |  |  |
| Boundary |  |  |  |  |
| Invalid/adversarial |  |  |  |  |

### 3) Determinism Plan
- **Time control:** How to avoid wall-clock dependence.
- **Randomness control:** How to seed or replace nondeterministic behavior.
- **External boundary isolation:** What to mock/fake at network, filesystem, or service boundaries.
- **Environment assumptions:** Which env inputs are fixed in tests.

## Workflow

### 1. Define the behavioral contract
- Identify SUT and write explicit behavioral rules.
- Confirm required outcomes are observable from public behavior.
- Stop and clarify requirements if contracts are ambiguous.

### 2. Design high-signal test cases
- Cover happy path, boundary conditions, and invalid/adversarial inputs.
- Prefer fewer meaningful tests over broad redundant coverage.
- Map every case to a specific behavioral rule.

### 3. Build determinism seams
- Isolate time, randomness, I/O, and environment dependencies.
- Keep tests fast, repeatable, and independent.
- Mock only external boundaries, not internal logic.

### 4. Write focused tests
- Use Arrange / Act / Assert.
- Verify one behavior per test.
- Assert observable outcomes, not internal implementation steps.

### 5. Validate test strength
- Confirm tests fail when behavior is intentionally broken.
- When feasible, perform a temporary negative sanity check (for example, flip a condition) and verify failure.
- Strengthen assertions that only check existence/success.

### 6. Screen for brittleness
- Remove coupling to private state, internal calls, and non-contractual ordering.
- Avoid re-implementing production algorithms inside tests.
- Replace broad snapshots with semantic assertions.

### 7. Finalize with definition of done
- Confirm contract coverage, deterministic behavior, and strong assertions.
- Document known untested risks and gaps explicitly.

## Test Quality Rubric
Apply this rubric to each test:

- **Behavioral signal:** Does the failure indicate a real contract break?
- **Falsifiability:** Can the test fail for the intended regression?
- **Determinism:** Is the result independent of time/random/external state?
- **Refactor stability:** Will harmless internal refactors keep the test passing?

## Definition of Done
A unit-testing task is complete only if:

- Contract and case matrix were produced before writing tests.
- Assertions validate behavior, not implementation details.
- Determinism controls are explicit.
- Regression sensitivity was validated.
- Remaining risks and uncovered behaviors are documented.

## Anti-patterns to avoid

### Testing implementation details
- Do not assert private methods, internal state, or internal call graphs unless they are part of the public contract.

### Excessive mocking
- Do not mock large internal portions of the SUT.
- Mock only true external boundaries.

### Re-implementing production logic
- Do not duplicate the SUT algorithm to compute expected values.
- Use independent expected outcomes.

### Weak assertions
- Avoid checks like `result exists` or `status is success` as the primary assertion.
- Assert business-relevant outcomes.

### Multiple behaviors in one test
- Keep one behavioral rule per test.

### Snapshot overuse
- Avoid large snapshots without semantic checks.
- Prefer targeted, behavior-specific assertions.

### Non-deterministic tests
- Do not rely on real clock, randomness, network, external systems, or ambient environment state.

### Untested failure path
- Ensure at least one negative or error-path test exists when failure behavior is part of the contract.

## Test naming guidance
Use behavior-oriented names:

`should <behavior> when <condition>`

Examples:
- `should return total when inputs are valid`
- `should reject negative quantity`
- `should throw validation error when payload is malformed`
