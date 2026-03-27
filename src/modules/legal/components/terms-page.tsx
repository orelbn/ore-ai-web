export function TermsPage() {
  const lastUpdated = "March 11, 2026";

  return (
    <main className="mx-auto max-w-xl px-4 py-16 sm:py-24">
      <div className="mb-10 space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/60">Ore AI</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms of Use</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated} &#8212; and probably never again.
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section aria-labelledby="section-reality">
          <h2 id="section-reality" className="mb-2 text-base font-semibold text-foreground">
            Let&#8217;s Be Realistic
          </h2>
          <p>
            This is a personal app built by one person, running on a budget that would make a
            startup CFO cry. By using it, you agree to these terms, which now exist for slightly
            more than decorative purposes.
          </p>
        </section>

        <section aria-labelledby="section-allowed">
          <h2 id="section-allowed" className="mb-2 text-base font-semibold text-foreground">
            What You Can Do
          </h2>
          <p>
            Use the app, ask it questions, and generally keep it to normal human behavior. If you
            want to know about coffee, projects, books, or whatever else Ore AI knows about,
            that&#8217;s exactly what it is here for.
          </p>
        </section>

        <section aria-labelledby="section-not-allowed">
          <h2 id="section-not-allowed" className="mb-2 text-base font-semibold text-foreground">
            What You Cannot Do
          </h2>
          <p>
            Don&#8217;t abuse it, scrape it, automate it into the ground, or use it for anything
            illegal, harmful, or deliberately disruptive. If traffic looks abusive, access can be
            limited or blocked without notice. If you have to ask whether something is okay, it
            probably isn&#8217;t.
          </p>
        </section>

        <section aria-labelledby="section-liability">
          <h2 id="section-liability" className="mb-2 text-base font-semibold text-foreground">
            Liability (None)
          </h2>
          <p>
            If the app is down, wrong, slow, or tells you something spectacularly incorrect about
            espresso extraction &#8212; that&#8217;s on you for trusting it. This is provided as-is,
            with no warranties, guarantees, SLAs, or promises of any kind. If something goes wrong,
            Orel is sorry, but also not liable.
          </p>
        </section>

        <section aria-labelledby="section-availability">
          <h2 id="section-availability" className="mb-2 text-base font-semibold text-foreground">
            Availability
          </h2>
          <p>
            The app will be up when it&#8217;s up and down when it&#8217;s not. It may change
            dramatically overnight, break for a week, or gain an entirely new personality. Stability
            is not a feature. Iteration is.
          </p>
        </section>

        <section aria-labelledby="section-changes">
          <h2 id="section-changes" className="mb-2 text-base font-semibold text-foreground">
            Changes to These Terms
          </h2>
          <p>
            These terms can change at any time for any reason, including but not limited to: Orel
            having a new opinion, a library update breaking something, or a general sense that the
            previous version was too serious. Continued use of the app means you accept whatever is
            written here at that moment.
          </p>
        </section>

        <section aria-labelledby="section-final">
          <h2 id="section-final" className="mb-2 text-base font-semibold text-foreground">
            Final Word
          </h2>
          <p>
            Be a decent human being while using this. That covers about 90% of what any terms of use
            is actually trying to say. The other 10% is lawyers justifying their billable hours,
            which don&#8217;t apply here.
          </p>
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
