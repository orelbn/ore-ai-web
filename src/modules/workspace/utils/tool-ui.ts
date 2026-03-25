import type { DynamicToolUIPart } from "ai";
import type { SessionMessage } from "@/modules/chat";

export type WorkspaceToolPart = DynamicToolUIPart;
export type WorkspaceToolResult = Extract<
	DynamicToolUIPart,
	{ state: "output-available" }
>;

export function isDynamicToolPart(
	part: SessionMessage["parts"][number],
): part is DynamicToolUIPart {
	return part.type === "dynamic-tool";
}

export function getDynamicToolParts(
	message: Pick<SessionMessage, "parts">,
): DynamicToolUIPart[] {
	return message.parts.filter(isDynamicToolPart);
}

export function extractLastToolResult(
	messages: Array<Pick<SessionMessage, "parts">>,
): WorkspaceToolResult | null {
	for (let index = messages.length - 1; index >= 0; index--) {
		const message = messages[index];
		for (const part of message.parts) {
			if (isDynamicToolPart(part) && part.state === "output-available") {
				return part;
			}
		}
	}

	return null;
}
