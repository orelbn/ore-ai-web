import { describe, expect, test } from "vite-plus/test";
import type { UIMessage } from "ai";
import {
  getSerializedByteSize,
  groupMessagesIntoTurns,
  selectMessagesByTurnSize,
} from "./context-window";

function textMessage(id: string, role: UIMessage["role"], text: string): UIMessage {
  return {
    id,
    role,
    parts: [{ type: "text", text }],
  };
}

describe("context window selection", () => {
  test("groups tool-heavy conversations into turns anchored by user messages", () => {
    const turns = groupMessagesIntoTurns([
      textMessage("u-1", "user", "first"),
      textMessage("a-1", "assistant", "reply"),
      textMessage("a-2", "assistant", "tool result"),
      textMessage("u-2", "user", "second"),
    ]);

    expect(turns).toHaveLength(2);
    expect(turns[0]?.map((message) => message.id)).toEqual(["u-1", "a-1", "a-2"]);
    expect(turns[1]?.map((message) => message.id)).toEqual(["u-2"]);
  });

  test("selects newest complete turns by byte budget", () => {
    const messages = [
      textMessage("u-1", "user", "a".repeat(200)),
      textMessage("a-1", "assistant", "b".repeat(200)),
      textMessage("u-2", "user", "c".repeat(50)),
      textMessage("a-2", "assistant", "d".repeat(50)),
    ];

    const newestTurnBytes = getSerializedByteSize(messages.slice(2));
    const selected = selectMessagesByTurnSize({
      messages,
      maxBytes: newestTurnBytes + 10,
    });

    expect(selected.map((message) => message.id)).toEqual(["u-2", "a-2"]);
  });

  test("always keeps the newest turn even when it alone exceeds budget", () => {
    const messages = [
      textMessage("u-1", "user", "hello"),
      textMessage("u-2", "user", "x".repeat(500)),
      textMessage("a-2", "assistant", "y".repeat(500)),
    ];

    const selected = selectMessagesByTurnSize({
      messages,
      maxBytes: 10,
    });

    expect(selected.map((message) => message.id)).toEqual(["u-2", "a-2"]);
  });
});
