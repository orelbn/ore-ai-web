import { beforeEach, describe, expect, test, vi } from "vitest";
import type { OreAgentUIMessage } from "@/modules/agent";
import {
  insertSession,
  readLatestSession,
  readSession,
  readSessionVersion,
  updateSession,
} from "./conversations";

const USER_ID = "user-1";
const SESSION_ID = "conversation-1";
const UPDATED_AT = new Date("2026-03-20T01:00:00.000Z");
const storedMessages = [
  {
    id: "assistant-1",
    role: "assistant",
    parts: [{ type: "text", text: "hello" }],
  },
  {
    id: 123,
    role: "assistant",
    parts: [{ type: "text", text: "bad" }],
  },
  "not-a-message",
];
const storedMessagesJson = JSON.stringify(storedMessages);

const state = vi.hoisted(() => ({
  findFirstResults: [] as Array<
    | {
        id: string;
        userId: string;
        updatedAt: Date;
      }
    | {
        id: string;
        userId: string;
        messagesJson: string;
        updatedAt: Date;
      }
    | null
  >,
  insertResults: [] as Array<{ meta: { changes: number } }>,
  updateResults: [] as Array<{ meta: { changes: number } }>,
  insertValues: [] as Array<Record<string, unknown>>,
  updateValues: [] as Array<Record<string, unknown>>,
}));

const database = {
  query: {
    chatConversations: {
      findFirst: vi.fn(async () => state.findFirstResults.shift() ?? null),
    },
  },
  insert: vi.fn(() => ({
    values: (values: Record<string, unknown>) => {
      state.insertValues.push(values);
      return {
        onConflictDoNothing: () => ({
          run: async () => state.insertResults.shift() ?? { meta: { changes: 1 } },
        }),
      };
    },
  })),
  update: vi.fn(() => ({
    set: (values: Record<string, unknown>) => {
      state.updateValues.push(values);
      return {
        where: () => ({
          run: async () => state.updateResults.shift() ?? { meta: { changes: 1 } },
        }),
      };
    },
  })),
};

vi.mock("@/services/database", () => ({
  getDatabase: () => database,
}));

beforeEach(() => {
  state.findFirstResults = [];
  state.insertResults = [];
  state.updateResults = [];
  state.insertValues = [];
  state.updateValues = [];
  database.query.chatConversations.findFirst.mockClear();
  database.insert.mockClear();
  database.update.mockClear();
});

function textMessage(id: string, role: OreAgentUIMessage["role"], text: string): OreAgentUIMessage {
  return {
    id,
    role,
    parts: [{ type: "text", text }],
  } satisfies OreAgentUIMessage;
}

function buildStoredConversationRow() {
  return {
    id: SESSION_ID,
    userId: USER_ID,
    messagesJson: storedMessagesJson,
    updatedAt: UPDATED_AT,
  };
}

function queueStoredConversationRow() {
  state.findFirstResults = [buildStoredConversationRow()];
}

describe("conversation repo", () => {
  test("should return the latest stored conversation row for the active user", async () => {
    const storedConversation = buildStoredConversationRow();
    queueStoredConversationRow();

    await expect(readLatestSession(USER_ID)).resolves.toStrictEqual(storedConversation);
  });

  test("should load a stored conversation for the active user", async () => {
    const storedConversation = buildStoredConversationRow();
    queueStoredConversationRow();

    await expect(
      readSession({
        userId: USER_ID,
        sessionId: SESSION_ID,
      }),
    ).resolves.toStrictEqual(storedConversation);
  });

  test("should read the save version for an existing conversation", async () => {
    state.findFirstResults = [{ id: SESSION_ID, userId: USER_ID, updatedAt: UPDATED_AT }];

    await expect(readSessionVersion(SESSION_ID)).resolves.toStrictEqual({
      id: SESSION_ID,
      userId: USER_ID,
      updatedAt: UPDATED_AT,
    });
  });

  test("should insert a new conversation row", async () => {
    const messages = [textMessage("u-1", "user", "hello")];
    const messagesJson = JSON.stringify(messages);

    await expect(
      insertSession({
        userId: USER_ID,
        sessionId: SESSION_ID,
        messagesJson,
      }),
    ).resolves.toMatchObject({ meta: { changes: 1 } });

    expect(state.insertValues).toStrictEqual([
      {
        id: SESSION_ID,
        userId: USER_ID,
        messagesJson,
      },
    ]);
    expect(state.updateValues).toStrictEqual([]);
  });

  test("should update an existing conversation row", async () => {
    const messagesJson = JSON.stringify([textMessage("u-1", "user", "hello")]);

    await expect(
      updateSession({
        userId: USER_ID,
        sessionId: SESSION_ID,
        messagesJson,
        updatedAt: UPDATED_AT,
      }),
    ).resolves.toMatchObject({ meta: { changes: 1 } });
    expect(state.updateValues).toHaveLength(1);
  });
});
