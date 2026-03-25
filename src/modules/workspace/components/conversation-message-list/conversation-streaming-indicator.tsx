import { LoaderCircle } from "lucide-react";
import { AssistantAvatar } from "./assistant-avatar";

export function ConversationStreamingIndicator() {
	return (
		<div className="flex items-start gap-3">
			<AssistantAvatar />
			<div className="flex items-center gap-2 rounded-2xl border border-border/30 bg-card/80 px-4 py-3 backdrop-blur-sm">
				<LoaderCircle
					className="size-3.5 animate-spin text-muted-foreground"
					strokeWidth={1.8}
				/>
				<span className="text-sm text-muted-foreground">
					OreAI is thinking…
				</span>
			</div>
		</div>
	);
}
