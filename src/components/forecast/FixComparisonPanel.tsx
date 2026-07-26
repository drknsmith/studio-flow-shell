import { DAY_NAMES_FULL, formatHour, getInstructor } from "@/lib/mock-data";
import type { UnderperformingRecommendation } from "@/lib/recommendations";

const FIX_LABEL: Record<UnderperformingRecommendation["fixType"], string> = {
  time: "New time",
  instructor: "New instructor",
  classType: "New format",
};

function currentDetailLine(rec: UnderperformingRecommendation): string {
  const dayName = DAY_NAMES_FULL[rec.target.dayOfWeek - 1];
  switch (rec.fixType) {
    case "time":
      return `${dayName}s, ${formatHour(rec.target.startHour)}`;
    case "instructor":
      return getInstructor(rec.target.instructorId)?.name ?? "Unassigned";
    case "classType":
      return rec.target.name;
  }
}

export function FixComparisonPanel({ recommendation }: { recommendation: UnderperformingRecommendation }) {
  const currentPct = Math.round((recommendation.target.booked / recommendation.target.capacity) * 100);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Current
          </div>
          <div className="num mt-1 font-display text-3xl font-semibold text-destructive">{currentPct}%</div>
          <div className="text-xs text-muted-foreground">average booked</div>
          <div className="mt-3 text-sm font-medium text-foreground">{currentDetailLine(recommendation)}</div>
        </div>
        <div className="rounded-xl border border-success/40 bg-success/10 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-success">
            {FIX_LABEL[recommendation.fixType]}
          </div>
          <div className="num mt-1 font-display text-3xl font-semibold text-success">
            {recommendation.proposal.projectedBookingPct}%
          </div>
          <div className="text-xs text-muted-foreground">typical booked</div>
          <div className="mt-3 text-sm font-medium text-foreground">{recommendation.proposal.label}</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{recommendation.proposal.description}</p>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium text-foreground">Client sentiment (current)</span>
          <span className="num text-muted-foreground">{recommendation.sentimentContext}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary" style={{ width: `${recommendation.sentimentContext}%` }} />
        </div>
      </div>
    </div>
  );
}
