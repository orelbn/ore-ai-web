import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { AssistantAvatar } from "./assistant-avatar";

export function ConversationStreamingIndicator() {
	return (
		<div className="flex items-start gap-3">
			<AssistantAvatar />
			<div className="flex items-center gap-2 rounded-2xl border border-border/30 bg-card/80 px-4 py-3 backdrop-blur-sm">
				<HugeiconsIcon
					icon={Settings01Icon}
					size={14}
					className="animate-spin text-muted-foreground"
					strokeWidth={1.8}
				/>
				<span className="text-sm text-muted-foreground">
					OreAI is thinking…
				</span>
			</div>
		</div>
	);
}
