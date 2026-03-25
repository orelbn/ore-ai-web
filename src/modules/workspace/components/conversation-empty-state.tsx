"use client";

export function ConversationEmptyState() {
	return (
		<div className="mb-8 flex flex-col items-center gap-5 text-center">
			<div className="relative">
				{/* Atmospheric glow behind avatar */}
				<div
					className="absolute inset-0 scale-150 rounded-full bg-primary/10 blur-2xl"
					aria-hidden="true"
				/>
				{/* Avatar container */}
				<div className="relative rounded-full bg-muted p-1.5 shadow-lg shadow-primary/10">
					<div className="flex size-36 items-center justify-center rounded-full bg-background">
						<img
							src="/ore-ai.webp"
							alt=""
							width={80}
							height={80}
							className="rounded-full"
							loading="eager"
							fetchPriority="high"
							decoding="async"
						/>
					</div>
				</div>
			</div>
			<div className="space-y-3">
				<p className="font-mono text-xs font-semibold tracking-widest text-primary uppercase">
					OreAI
				</p>
				<h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
					What would you like to talk about?
				</h1>
			</div>
		</div>
	);
}
