import { getDynamicToolParts } from "@/modules/agent";
import { extractPlainTextFromParts, type SessionMessage } from "@/modules/chat";
import { AssistantAvatar } from "./assistant-avatar";
import { ToolStatusBadge } from "./tool-status-badge";

type ConversationMessageRowProps = {
  message: SessionMessage;
};

export function ConversationMessageRow({ message }: ConversationMessageRowProps) {
  const text = extractPlainTextFromParts(message.parts);
  const toolParts = getDynamicToolParts(message);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl bg-primary px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground shadow-sm">
          {text || "(No text content)"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <AssistantAvatar />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {text ? (
          <div className="max-w-[92%] rounded-2xl border border-border/30 bg-card/80 px-4 py-3 text-sm leading-7 whitespace-pre-wrap text-foreground shadow-sm backdrop-blur-sm">
            {text}
          </div>
        ) : null}
        {toolParts.map((part) => (
          <ToolStatusBadge key={part.toolCallId} part={part} />
        ))}
      </div>
    </div>
  );
}
