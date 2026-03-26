import { CheckCircle2, LoaderCircle } from "lucide-react";
import type { AgentToolPart } from "@/modules/agent";
import { formatToolName } from "../../utils/format-tool-name";

type ToolStatusBadgeProps = {
	part: AgentToolPart;
};

export function ToolStatusBadge({ part }: ToolStatusBadgeProps) {
	const isDone = part.state === "output-available";
	const label = formatToolName(part.toolName);

	return (
		<div className="flex w-fit items-center gap-2 rounded-full border border-border/30 bg-card/60 px-3 py-1.5 backdrop-blur-sm">
			{isDone ? (
				<CheckCircle2 className="size-3.25 text-primary" strokeWidth={1.8} />
			) : (
				<LoaderCircle
					className="size-3.25 animate-spin text-muted-foreground"
					strokeWidth={1.8}
				/>
			)}
			<span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
				{isDone ? label : `Running ${label}…`}
			</span>
		</div>
	);
}
