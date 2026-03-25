import { Coffee, Dumbbell, Swords } from "lucide-react";

export const FEATURE_CARDS = [
	{
		icon: Coffee,
		title: "Coffee Places",
		description: "Find out Orel's Favouriate coffee places.",
		prompt: "What are Orel's favorite coffee shops?",
	},
	{
		icon: Swords,
		title: "MMA Hot Takes",
		description: "Find out about Orel's mma outtakes.",
		prompt: "What are Orel's hot takes on recent MMA fights?",
	},
	{
		icon: Dumbbell,
		title: "Workout Routine",
		description: "Find out how orel is staying active these days.",
		prompt: "What is Orel's workout routine?",
	},
];

type ConversationFeatureCardsProps = {
	onPromptSelect: (prompt: string) => void;
};

export function ConversationFeatureCards({
	onPromptSelect,
}: ConversationFeatureCardsProps) {
	return (
		<div className="mt-12 grid gap-3 sm:grid-cols-3">
			{FEATURE_CARDS.map((card) => (
				<button
					key={card.title}
					type="button"
					onClick={() => onPromptSelect(card.prompt)}
					className="group rounded-xl border border-border/30 bg-card/30 p-5 text-left transition-all hover:border-border/60 hover:bg-card/50"
				>
					<card.icon
						className="mb-3 block size-6 text-primary/70"
						strokeWidth={1.8}
					/>
					<h3 className="mb-1.5 text-sm font-semibold text-foreground">
						{card.title}
					</h3>
					<p className="text-xs leading-relaxed text-muted-foreground">
						{card.description}
					</p>
				</button>
			))}
		</div>
	);
}
