import { describe, expect, test } from "bun:test";
import type { OreAgentUIMessage } from "@/lib/agents/ore-agent";
import {
	CHAT_PREVIEW_MAX_CHARS,
	CHAT_TITLE_MAX_CHARS,
} from "@/lib/chat/ui-constants";
import {
	buildSessionPreviewFromInput,
	buildSessionTitleFromInput,
	createSessionId,
	extractPlainText,
	formatUpdatedAt,
} from "./workspace-utils";

describe("workspace utils", () => {
	test("creates a non-empty session id", () => {
		const id = createSessionId();
		expect(id.length).toBeGreaterThan(0);
	});

	test("extracts plain text from mixed message parts", () => {
		const parts = [
			{ type: "text", text: "first line" },
			{ type: "reasoning", text: "internal" },
			{ type: "text", text: "second line" },
		] as unknown as OreAgentUIMessage["parts"];

		expect(extractPlainText(parts)).toBe("first line\nsecond line");
	});

	test("builds a default title for empty input", () => {
		expect(buildSessionTitleFromInput("   ")).toBe("New session");
	});

	test("truncates long titles", () => {
		const title = buildSessionTitleFromInput("a".repeat(120));
		expect(title.length).toBe(CHAT_TITLE_MAX_CHARS);
	});

	test("truncates long previews", () => {
		const preview = buildSessionPreviewFromInput("a".repeat(400));
		expect(preview.length).toBe(CHAT_PREVIEW_MAX_CHARS);
	});

	test("formats timestamps", () => {
		const formatted = formatUpdatedAt(
			new Date("2026-02-24T12:00:00Z").getTime(),
		);
		expect(formatted.length).toBeGreaterThan(0);
	});
});
