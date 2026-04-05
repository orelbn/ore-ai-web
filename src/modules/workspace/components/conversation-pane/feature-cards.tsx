import { FEATURE_CARDS } from "../../data/feature-cards";

type ConversationFeatureCardsProps = {
  onPromptSelect: (prompt: string) => void;
};

export function ConversationFeatureCards({ onPromptSelect }: ConversationFeatureCardsProps) {
  return (
    <div className="mt-6 grid gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-4">
      {FEATURE_CARDS.map((card) => (
        <button
          key={card.title}
          type="button"
          onClick={() => onPromptSelect(card.prompt)}
          className="group rounded-xl border border-border/30 bg-card/30 p-4 text-left transition-all hover:border-border/60 hover:bg-card/50 sm:p-5"
        >
          <card.icon
            className="mb-2.5 block size-5 text-primary/70 sm:mb-3 sm:size-6"
            strokeWidth={1.8}
          />
          <h3 className="mb-1.5 text-sm font-semibold text-foreground">{card.title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">{card.description}</p>
        </button>
      ))}
    </div>
  );
}
