import type { UnderperformingRecommendation } from "@/lib/recommendations";

export function UnderperformingPanel({ recommendation }: { recommendation: UnderperformingRecommendation }) {
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-destructive">
        AI underperformance alert
      </div>
      <div className="mt-1 font-display text-xl font-semibold text-foreground">
        {recommendation.headline}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">{recommendation.pattern}</div>
      <p className="mt-2 text-sm text-foreground/90">{recommendation.rationale}</p>
    </div>
  );
}
