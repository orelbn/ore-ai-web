import type { DynamicToolUIPart } from "ai";
import type { OreAgentUIMessage } from "./types";

export type AgentToolPart = DynamicToolUIPart;
export type AgentToolResult = Extract<
	DynamicToolUIPart,
	{ state: "output-available" }
>;

export function isDynamicToolPart(
	part: OreAgentUIMessage["parts"][number],
): part is DynamicToolUIPart {
	return part.type === "dynamic-tool";
}

export function getDynamicToolParts(
	message: Pick<OreAgentUIMessage, "parts">,
): DynamicToolUIPart[] {
	return message.parts.filter(isDynamicToolPart);
}

export function extractLastToolResult(
	messages: Array<Pick<OreAgentUIMessage, "parts">>,
): AgentToolResult | null {
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
