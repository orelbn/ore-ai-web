export function PrivacyPage() {
	const lastUpdated = "March 23, 2026";

	return (
		<main className="mx-auto max-w-xl px-4 py-16 sm:py-24">
			<div className="mb-10 space-y-2">
				<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/60">
					Ore AI
				</p>
				<h1 className="text-3xl font-bold tracking-tight text-foreground">
					Privacy Policy
				</h1>
				<p className="text-sm text-muted-foreground">
					Last updated: {lastUpdated}
				</p>
			</div>

			<div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
				<section aria-labelledby="section-short">
					<h2
						id="section-short"
						className="mb-2 text-base font-semibold text-foreground"
					>
						The Short Version
					</h2>
					<p>
						This is a personal project. The app keeps a small amount of data so
						it can open an anonymous chat session, remember the conversation,
						and slow down abuse. Nothing is sold. Nothing is used for ads.
						That&#8217;s the short version.
					</p>
				</section>

				<section aria-labelledby="section-collect">
					<h2
						id="section-collect"
						className="mb-2 text-base font-semibold text-foreground"
					>
						What Is Collected
					</h2>
					<div className="space-y-4">
						<p>
							When you use Ore AI, the app currently keeps three main kinds of
							information:
						</p>
						<p>
							First, it keeps anonymous access records. That includes an
							anonymous account ID, session records that keep you signed in
							while you use the app, and limited connection details such as IP
							address and browser information tied to that session.
						</p>
						<p>
							Second, it keeps chat content. That includes the messages you send
							and the responses returned in the conversation so the chat can
							load again after a refresh and continue from the latest state.
						</p>
						<p>
							Third, the app and its hosting or security providers may keep
							limited security and abuse-prevention data, such as verification
							results, rate-limit records, and request metadata used to spot
							spam, bots, and misuse.
						</p>
						<p>
							Because chat messages are stored to run the product and are sent
							to Google Gemini to generate replies, don&#8217;t share secrets,
							passwords, or other sensitive personal information in the chat.
						</p>
					</div>
				</section>

				<section aria-labelledby="section-why">
					<h2
						id="section-why"
						className="mb-2 text-base font-semibold text-foreground"
					>
						Why It&#8217;s Collected
					</h2>
					<div className="space-y-4">
						<p>
							Anonymous access records are used to keep the app available across
							page loads and follow-up requests without asking you to make a
							full account.
						</p>
						<p>
							Chat content is used so Ore AI can answer your prompt, keep the
							conversation coherent, and restore the current chat after a
							refresh or return visit while that conversation is still
							available.
						</p>
						<p>
							Security and abuse-prevention data is used to protect the service,
							filter obvious bot traffic, enforce limits, and investigate
							problems when something goes wrong.
						</p>
						<p>
							It is not collected to build an advertising profile, sell your
							information, or run a hidden analytics business around your use of
							the app.
						</p>
					</div>
				</section>

				<section aria-labelledby="section-sharing">
					<h2
						id="section-sharing"
						className="mb-2 text-base font-semibold text-foreground"
					>
						Sharing
					</h2>
					<p>
						Your data is not sold or rented. Chat messages are shared with
						Google Gemini so the assistant can generate replies. Security and
						hosting providers may also process limited technical data needed to
						run the site and verify requests. Google&#8217;s handling of data is
						described in{" "}
						<a
							href="https://policies.google.com/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground underline underline-offset-2 transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
						>
							Google&#8217;s Privacy Policy
						</a>
						. Gemini-specific terms are also available in{" "}
						<a
							href="https://ai.google.dev/gemini-api/terms"
							target="_blank"
							rel="noopener noreferrer"
							className="text-foreground underline underline-offset-2 transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
						>
							the Gemini API Additional Terms
						</a>
						.
					</p>
				</section>

				<section aria-labelledby="section-retention">
					<h2
						id="section-retention"
						className="mb-2 text-base font-semibold text-foreground"
					>
						Data Retention
					</h2>
					<div className="space-y-4">
						<p>
							The app keeps anonymous session records and current chat history
							for as long as they are needed to keep the chat working and
							restore active conversations.
						</p>
						<p>
							Starting a new chat stops using the previous conversation in the
							main interface, but older records may still remain for a period in
							the app database, logs, backups, or third-party provider systems
							that help run the service.
						</p>
						<p>
							Retention can change as the product evolves, but the goal is still
							to keep only what is needed to operate the app and keep it safe.
						</p>
					</div>
				</section>

				<section aria-labelledby="section-contact">
					<h2
						id="section-contact"
						className="mb-2 text-base font-semibold text-foreground"
					>
						Contact
					</h2>
					<p>Questions? Orel built this. Find him and ask.</p>
				</section>
			</div>

			<div className="mt-12">
				<a
					href="/"
					className="text-sm text-muted-foreground/50 underline underline-offset-2 transition-colors hover:text-muted-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
				>
					&larr; Back
				</a>
			</div>
		</main>
	);
}
