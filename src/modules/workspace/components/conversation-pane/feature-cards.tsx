export const FEATURE_CARDS = [
	{
		icon: "local_cafe",
		title: "Coffee Places",
		description: "Find out Orel's Favouriate coffee places.",
		prompt: "What are Orel's favorite coffee shops?",
	},
	{
		icon: "sports_mma",
		title: "MMA Hot Takes",
		description: "Find out about Orel's mma outtakes.",
		prompt: "What are Orel's hot takes on recent MMA fights?",
	},
	{
		icon: "fitness_center",
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
					<span
						className="ms mb-3 block text-2xl text-primary/70"
						style={{
							fontVariationSettings:
								'"FILL" 0, "wght" 200, "GRAD" 0, "opsz" 24',
						}}
					>
						{card.icon}
					</span>
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
