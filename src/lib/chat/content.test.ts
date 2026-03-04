import { describe, expect, test } from "bun:test";
import type { UIMessage } from "ai";
import { CHAT_PREVIEW_MAX_CHARS, CHAT_TITLE_MAX_CHARS } from "./constants";
import {
	buildPreviewFromInput,
	buildTitleFromInput,
	buildTitleFromMessage,
	extractPlainTextFromParts,
} from "./content";

describe("chat content helpers", () => {
	test("extracts only text parts", () => {
		const text = extractPlainTextFromParts([
			{ type: "text", text: "first" },
			{ type: "reasoning", text: "ignored" },
			{ type: "text", text: "second" },
		]);

		expect(text).toBe("first\nsecond");
	});

	test("uses fallback title when input is empty", () => {
		expect(buildTitleFromInput("   ", "fallback")).toBe("fallback");
	});

	test("truncates title and preview with shared limits", () => {
		expect(buildTitleFromInput("a".repeat(200)).length).toBe(
			CHAT_TITLE_MAX_CHARS,
		);
		expect(buildPreviewFromInput("b".repeat(500)).length).toBe(
			CHAT_PREVIEW_MAX_CHARS,
		);
	});

	test("builds titles from message parts", () => {
		const message = {
			parts: [{ type: "text", text: "Plan my week" }],
		} as Pick<UIMessage, "parts">;

		expect(buildTitleFromMessage(message)).toBe("Plan my week");
	});
});
