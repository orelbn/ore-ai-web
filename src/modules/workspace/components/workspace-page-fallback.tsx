import { MascotHero } from "@/components/layout/mascot-hero";

export function WorkspacePageFallback() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6">
			<MascotHero imageSize={88} animateWave />
			<div className="space-y-2 text-center">
				<h1 className="text-xl font-semibold tracking-tight">
					Loading your workspace
				</h1>
				<p className="text-sm text-muted-foreground">
					Ore AI is warming up the conversation context and getting the
					workspace ready.
				</p>
			</div>
		</main>
	);
}
