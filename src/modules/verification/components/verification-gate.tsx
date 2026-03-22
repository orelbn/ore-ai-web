"use client";

import { VerificationChallenge } from "./verification-challenge";

type VerificationGateProps = {
	challenge: {
		action: string;
		onError: () => void;
		onExpired: () => void;
		onToken: (token: string) => void;
		siteKey: string;
		widgetKey: number;
	} | null;
	error: string | null;
	isPending: boolean;
};

export function VerificationGate({
	challenge,
	error,
	isPending,
}: VerificationGateProps) {
	return (
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground">
			<div
				aria-hidden="true"
				className="page-background-glow page-background-glow-top-left absolute left-[-14rem] top-[-18rem] opacity-60"
			/>
			<div
				aria-hidden="true"
				className="page-background-glow page-background-glow-bottom-right absolute bottom-[-18rem] right-[-10rem] opacity-70"
			/>
			<div
				aria-hidden="true"
				className="page-background-noise absolute inset-0 opacity-[0.12]"
			/>

			<section className="relative w-full max-w-md">
				<div className="rounded-[2rem] border border-border/70 bg-card/88 p-5 shadow-[0_30px_90px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-6">
					{challenge ? <VerificationChallenge {...challenge} /> : null}
					{isPending ? (
						<div className="flex min-h-[72px] items-center justify-center rounded-2xl border border-border/70 bg-background/70 px-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-3">
								<span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary/75 animate-pulse" />
								Preparing secure session
							</div>
						</div>
					) : null}
					{error ? (
						<p
							className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm leading-6 text-destructive"
							role="alert"
						>
							{error}
						</p>
					) : null}
				</div>
			</section>
		</main>
	);
}
