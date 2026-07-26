import type { Recommendation } from "@/lib/recommendations";

export function RecommendationPanel({ recommendation }: { recommendation: Recommendation }) {
  return (
    <div className="rounded-xl border border-accent/40 bg-accent/10 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-accent-foreground/70">
        AI capacity forecast
      </div>
      <div className="mt-1 font-display text-xl font-semibold text-foreground">
        {recommendation.headline}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{recommendation.pattern}</div>
      <p className="mt-2 text-sm text-foreground/90">{recommendation.rationale}</p>
    </div>
  );
}
