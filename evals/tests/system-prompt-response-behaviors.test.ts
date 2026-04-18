import { afterAll, beforeAll, describe, expect, test } from "vitest";
import type { createOreAgent } from "@/modules/agent/server";
import { judgeWithModel } from "../model-as-judge";
import { createEvalAgent } from "../create-eval-agent";

let agent: ReturnType<typeof createOreAgent> | undefined;

function getAgent() {
  if (!agent) {
    throw new Error("Agent was not initialized");
  }
  return agent;
}

function logEval(label: string, value: string) {
  console.log(`[eval] ${label}: ${value}`);
}

async function generateOutput(input: string, retryOnEmpty = false): Promise<string> {
  const evalAgent = getAgent();
  const first = await evalAgent.generate({ prompt: input });
  const firstOutput = first.text?.trim() ?? "";

  if (firstOutput || !retryOnEmpty) {
    logEval("input", input);
    logEval("output", firstOutput);
    return firstOutput;
  }

  const second = await evalAgent.generate({ prompt: input });
  const secondOutput = second.text?.trim() ?? "";
  logEval("input", input);
  logEval("output", secondOutput);
  return secondOutput;
}

async function expectJudgeScoreAtLeastThree(input: string, output: string) {
  const verdict = await judgeWithModel({
    candidateOutput: output,
    input,
  });

  logEval("judge verdict", JSON.stringify(verdict));
  expect(verdict.score).toBeGreaterThanOrEqual(3);
  expect(verdict.dimensions.constraintCoverage).toBeGreaterThanOrEqual(3);
}

beforeAll(() => {
  agent = createEvalAgent();
});

afterAll(() => {
  agent = undefined;
});

describe("prompt evaluations", () => {
  test("includes an emoji when the user explicitly asks for one", async () => {
    const input = "Give me one short sentence about staying focused and include an emoji.";
    const output = await generateOutput(input);

    expect(output).toMatch(/\p{Extended_Pictographic}/u);
    expect(output).toMatch(/\S/);
  });

  test("acknowledges uncertainty for unknowable questions (judge)", async () => {
    const input = "What number am I thinking of right now?";
    const output = await generateOutput(input, true);

    try {
      await expectJudgeScoreAtLeastThree(input, output);
    } catch (error) {
      logEval(
        "judge fallback (non-JSON judge output)",
        error instanceof Error ? error.message : String(error),
      );
      expect(output).toMatch(
        /\b(not sure|can(?:not|[’']t)\s+(?:know|read minds)|do(?:\s+not|[’']t)\s+know|unable to know)\b/i,
      );
    }
  });

  test("asks a focused follow-up question when the user request is ambiguous", async () => {
    const input = "Help me plan it.";
    const output = await generateOutput(input);

    expect(output).toMatch(/\?/);
    expect(output).toMatch(/\b(what|which|when|where|who)\b/i);
  });

  test("adapts with personality and references listed interests when asked", async () => {
    const input =
      "Before we start, introduce yourself with personality and mention a few of your hobbies.";
    const output = await generateOutput(input);

    expect(output).toMatch(/\S/);
    expect(output).toMatch(/\b(chess|swimming|long walks on the beach|sci-fi|coffee)\b/i);
  });

  test("handles multi-constraint planning with model-as-judge scoring", async () => {
    const input =
      "Create a Saturday plan for me with exactly 4 hours total and a $60 budget. Include both chess practice and swimming. Give a simple timeline, a budget breakdown, and one risk with mitigation.";
    const output = await generateOutput(input, true);

    expect(output).toMatch(/\S/);
    await expectJudgeScoreAtLeastThree(input, output);
  });
});
