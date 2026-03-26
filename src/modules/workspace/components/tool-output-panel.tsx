"use client";

import type { AgentToolPart } from "@/modules/agent";
import { ToolOutputInputSection } from "./tool-output-panel/tool-output-input-section";
import { ToolOutputPanelHeader } from "./tool-output-panel/tool-output-panel-header";
import { ToolOutputResultSection } from "./tool-output-panel/tool-output-result-section";

type ToolOutputPanelProps = {
	toolResult: AgentToolPart;
};

export function ToolOutputPanel({ toolResult }: ToolOutputPanelProps) {
	return (
		<div className="flex h-full flex-col overflow-hidden">
			<ToolOutputPanelHeader toolResult={toolResult} />

			<div className="flex-1 overflow-y-auto">
				<ToolOutputInputSection input={toolResult.input} />
				<ToolOutputResultSection toolResult={toolResult} />
			</div>
		</div>
	);
}
