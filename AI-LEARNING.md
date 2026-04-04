# AI Learning Log

This file tracks lessons and notes from hands-on experience with AI.
These notes reflect my personal experience. If your experience differs, please feel free to reach out.
I also have specific taste and expectations around code quality and rigor, so if your standards or workflow differ, your experience may be different too.

My approach to code quality is influenced by the following principles:

- Separate concerns so code is easy to follow.
- Prefer less code when it achieves the same result.
- Be deliberate about when to use a library versus building something yourself.
- Keep files small, readable, and highly cohesive.
- Favor structures that make future feature work easier to place and easier to review.
- Bad or low-signal tests are worse than no tests because they waste compute, add maintenance cost, and create noise.
- Think about tests in terms of risk versus reward.
- Smoke tests can be valuable, but avoid tests whose main value is checking fragile wording or layout details.
- Avoid brittle tests that fail because wording or layout changed slightly without changing behavior.
- Prefer integration tests over mocking when the cost is reasonable.
- Prefer library best practices over ad hoc patterns that generate unnecessary code.

In the future, I may also add example prompts and the results they produced.

## Entries

### 2026-04-03

#### Choose libraries early for complex workflows

AI built a complex auth flow for anonymous login and rate limiting with many edge cases, but it produced much more code to maintain, review, and test than necessary.

Takeaway: a better approach was to choose the libraries up front and implement the solution alongside the AI so the result stayed aligned with the real requirements. That reduced the code by thousands of lines, relied on battle-tested open source libraries, and left the system easier to extend.

#### Give structure by example when separation of concerns matters

AI struggled to refactor code so auth, rate limiting, and business logic were cleanly separated. Even with detailed prompts, the concerns stayed mixed together.

Takeaway: providing a concrete example of the desired structure worked much better than describing it in prose. Once the shape was clear, the AI could fill in the implementation details and produce code that followed SRP more closely.

#### AI is weak at inventing strong UI design from scratch

GPT-5.4 struggled to produce strong UI design, even after multiple attempts and skills. The results were consistently weak and often introduced too many CSS classes.

Takeaway: AI can help explore UI directions, but good results usually require a design system and clear aesthetic established by a human first. Once that foundation exists, AI is much more useful for extending it than inventing it from scratch.

#### AI works best for me when I stay involved and keep the work reviewable

AI is not only useful for tiny fixes. It also works well on larger features when the implementation is broken into reasonable-sized changes instead of one large handoff, and when I work alongside it instead of reviewing everything afterward. I tried letting the AI handle more work independently, and while it often produced something functional, the code quality was weaker, the system became more complex than necessary, and the result often drifted away from what I actually intended to build.

Takeaway: staying involved during implementation helps me catch wrong assumptions and mistakes much earlier, understand the code and the system better, and guide the work toward what I actually need. Keeping the work in reviewable chunks also keeps me sharper, avoids exhausting my ability to review code well, and makes it easier to push the quality higher in architecture, tests, and implementation details. It also creates much better learning because I am understanding the implementation as it happens instead of only reading a summary afterward. The output feels more trustworthy, the quality is better, and the workflow consistently feels closer to 2x to 5x faster than working alone.

#### Implementation changes your understanding of the problem

Part of doing the work is getting an actual feel for how the feature behaves while it is being built. What I think I want at the start often changes as implementation makes the tradeoffs, friction points, and simplification opportunities more obvious.

Takeaway: building in smaller steps makes it easier to simplify, pivot, and improve the design as the feature evolves. That is one of the main reasons I do not want AI to take over the whole process too early. I want the implementation process itself to help shape the solution.

#### Do not let AI replace your judgment

I do not want AI to replace my own judgment or problem-solving ability. Part of the value of this field is understanding complex systems and designing solutions with confidence.

Takeaway: AI should support the process, not replace it. I want to understand and be confident in the solutions I implement, even when AI helps produce them.

#### Be careful with scope because AI makes it easy to change too much at once

AI makes it very easy to touch a lot of code in a single pass, which can make it tempting to fix every adjacent issue while working on one task.

Takeaway: the same discipline that mattered before AI still matters with AI. Stay focused on the task at hand, keep changes scoped to the feature you are actually trying to ship, and address unrelated issues separately. Otherwise it becomes easy to get derailed and slow down delivery instead of speeding it up.

#### Learning what to watch for improves future collaboration

Reviewing AI output as it is produced teaches me what to watch for in future runs.

Takeaway: over time, this makes it easier to spot risky patterns quickly and build trust in the parts the AI handles well. There are still cases where letting the AI work more independently is useful, especially for difficult bug investigation, but in general I expect to let it do more only as the output keeps improving and I learn where it is reliable.

### Template

#### Short title

What happened.

Takeaway: what I learned, what changed, or what I would do differently next time.
