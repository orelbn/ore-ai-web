import type { AgentToolPart } from "@/modules/agent";
import { formatToolName } from "../../utils/format-tool-name";

type ToolOutputInputSectionProps = {
	input: AgentToolPart["input"];
};

function renderValue(value: unknown): string {
	if (typeof value === "string") {
		return value;
	}

	if (value === null || value === undefined) {
		return "—";
	}

	return JSON.stringify(value, null, 2);
}

export function ToolOutputInputSection({ input }: ToolOutputInputSectionProps) {
	if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
		return null;
	}

	return (
		<div className="border-b border-border/30 px-4 py-4">
			<p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
				Input
			</p>
			<dl className="space-y-2">
				{Object.entries(input as Record<string, unknown>).map(
					([key, value]) => (
						<div key={key}>
							<dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{formatToolName(key)}
							</dt>
							<dd className="mt-0.5 text-sm text-foreground">
								{renderValue(value)}
							</dd>
						</div>
					),
				)}
			</dl>
		</div>
	);
}
