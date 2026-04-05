import { LoaderCircle } from "lucide-react";
import type { AgentToolPart } from "@/modules/agent";
import { formatToolName } from "../../utils/format-tool-name";
import { getRecordValue } from "./tool-output-panel-utils";

type ToolOutputResultSectionProps = {
  toolResult: AgentToolPart;
};

function getResultRows(result: unknown): Array<{ label: string; value: string }> {
  return Object.entries(getRecordValue(result) ?? {})
    .filter(([, value]) => typeof value !== "object" || value === null)
    .map(([label, value]) => ({
      label: formatToolName(label),
      value: String(value),
    }));
}

function renderResultContent(toolResult: AgentToolPart): React.ReactNode {
  const resultText = typeof toolResult.output === "string" ? toolResult.output : null;

  if (resultText) {
    return <p className="text-sm leading-relaxed text-foreground">{resultText}</p>;
  }

  const objectResult = getRecordValue(toolResult.output);

  if (!objectResult) {
    return null;
  }

  const rows = getResultRows(objectResult);

  if (rows.length > 0) {
    return (
      <dl className="space-y-3">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-start justify-between gap-3 rounded-lg border border-border/30 bg-card/60 px-3 py-2.5"
          >
            <dt className="flex items-center gap-2 text-xs text-muted-foreground">
              <LoaderCircle
                className="size-3 shrink-0 text-muted-foreground/50"
                strokeWidth={1.8}
              />
              {label}
            </dt>
            <dd className="text-xs font-semibold text-primary">{value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <pre className="overflow-x-auto rounded-lg border border-border/30 bg-card/60 p-3 text-xs leading-relaxed text-foreground">
      {JSON.stringify(objectResult, null, 2)}
    </pre>
  );
}

export function ToolOutputResultSection({ toolResult }: ToolOutputResultSectionProps) {
  if (toolResult.state !== "output-available") {
    return (
      <div className="flex items-center gap-2.5 px-4 py-6">
        <LoaderCircle className="size-4 animate-spin text-muted-foreground" strokeWidth={1.8} />
        <span className="text-sm text-muted-foreground">Running…</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
        Result
      </p>
      {renderResultContent(toolResult)}
    </div>
  );
}
