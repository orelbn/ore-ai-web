import { HugeiconsIcon } from "@hugeicons/react";
import {
	CheckmarkCircle01Icon,
	Settings01Icon,
} from "@hugeicons/core-free-icons";
import type { WorkspaceToolPart } from "../../utils/tool-ui";
import { formatToolName } from "../../utils/format-tool-name";

type ToolStatusBadgeProps = {
	part: WorkspaceToolPart;
};

export function ToolStatusBadge({ part }: ToolStatusBadgeProps) {
	const isDone = part.state === "output-available";
	const label = formatToolName(part.toolName);

	return (
		<div className="flex w-fit items-center gap-2 rounded-full border border-border/30 bg-card/60 px-3 py-1.5 backdrop-blur-sm">
			<HugeiconsIcon
				icon={isDone ? CheckmarkCircle01Icon : Settings01Icon}
				size={13}
				className={
					isDone ? "text-primary" : "animate-spin text-muted-foreground"
				}
				strokeWidth={1.8}
			/>
			<span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
				{isDone ? label : `Running ${label}…`}
			</span>
		</div>
	);
}
