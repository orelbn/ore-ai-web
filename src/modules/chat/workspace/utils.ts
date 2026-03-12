import type { OreAgentUIMessage } from "@/services/google-ai/ore-agent";
import { extractPlainTextFromParts } from "../messages/content";

export function extractPlainText(parts: OreAgentUIMessage["parts"]): string {
	return extractPlainTextFromParts(parts);
}
