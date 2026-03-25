"use client";

import type { WorkspaceToolPart } from "../utils/tool-ui";
import { ToolOutputInputSection } from "./tool-output-panel/tool-output-input-section";
import { ToolOutputPanelHeader } from "./tool-output-panel/tool-output-panel-header";
import { ToolOutputResultSection } from "./tool-output-panel/tool-output-result-section";

type ToolOutputPanelProps = {
	toolResult: WorkspaceToolPart;
};

export function ToolOutputPanel({ toolResult }: ToolOutputPanelProps) {
	return (
		<div className="flex h-full flex-col overflow-hidden">
			<ToolOutputPanelHeader toolResult={toolResult} />

			<div className="scrollbar-transparent flex-1 overflow-y-auto">
				<ToolOutputInputSection input={toolResult.input} />
				<ToolOutputResultSection toolResult={toolResult} />
			</div>
		</div>
	);
}
