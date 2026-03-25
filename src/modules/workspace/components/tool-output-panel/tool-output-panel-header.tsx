import { CheckCircle2, Expand, LoaderCircle } from "lucide-react";
import type { WorkspaceToolPart } from "../../utils/tool-ui";
import { formatToolName } from "../../utils/format-tool-name";

type ToolOutputPanelHeaderProps = {
	toolResult: WorkspaceToolPart;
};

export function ToolOutputPanelHeader({
	toolResult,
}: ToolOutputPanelHeaderProps) {
	const isDone = toolResult.state === "output-available";
	const displayName = formatToolName(toolResult.toolName);

	return (
		<div className="flex items-center gap-3 border-b border-border/30 px-4 py-3">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
				{isDone ? (
					<CheckCircle2 className="size-4 text-primary" strokeWidth={1.8} />
				) : (
					<LoaderCircle className="size-4 text-primary" strokeWidth={1.8} />
				)}
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
					Tool Output
				</p>
				<p className="truncate text-xs font-semibold text-foreground">
					{displayName.toUpperCase()}
				</p>
			</div>
			<button
				type="button"
				aria-label="Expand panel"
				className="shrink-0 rounded-md p-1.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-muted-foreground"
			>
				<Expand className="size-3.5" strokeWidth={1.8} />
			</button>
		</div>
	);
}
