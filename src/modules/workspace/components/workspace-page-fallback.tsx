import { MascotHero } from "@/components/layout/mascot-hero";

export function WorkspacePageFallback() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
			<div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card/95 px-8 py-10 text-center shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur">
				<MascotHero imageSize={88} animateWave className="gap-4" />
				<div className="mt-8 space-y-3">
					<h1 className="text-xl font-semibold tracking-tight">
						Loading your workspace
					</h1>
					<p className="text-sm leading-6 text-muted-foreground">
						Ore AI is warming up the conversation context and getting the
						workspace ready.
					</p>
				</div>
			</div>
		</main>
	);
}
