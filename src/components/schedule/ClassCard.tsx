import { cn } from "@/lib/utils";
import type { ClassSession } from "@/lib/mock-data";
import { formatHour, getInstructor } from "@/lib/mock-data";
import { getRecommendationForSession } from "@/lib/recommendations";
import { useIsRecommendationCommitted, useSelectedRecommendationId } from "@/hooks/use-forecast";
import { AIFlashBadge } from "@/components/forecast/AIFlashBadge";

const CATEGORY_TINT: Record<string, string> = {
  yoga: "border-l-[color:var(--chart-1)] bg-[color:var(--chart-1)]/6",
  pilates: "border-l-[color:var(--chart-3)] bg-[color:var(--chart-3)]/6",
  cycle: "border-l-[color:var(--chart-4)] bg-[color:var(--chart-4)]/8",
  hiit: "border-l-destructive bg-destructive/6",
  barre: "border-l-accent bg-accent/8",
  meditation: "border-l-[color:var(--chart-5)] bg-[color:var(--chart-5)]/6",
  strength: "border-l-primary bg-primary/6",
};

export function ClassCard({
  session,
  compact = false,
}: {
  session: ClassSession;
  compact?: boolean;
}) {
  const instructor = getInstructor(session.instructorId);
  const pct = Math.min(100, Math.round((session.booked / session.capacity) * 100));
  const { setId } = useSelectedRecommendationId();
  const matchedRecommendation = getRecommendationForSession(session);
  const committed = useIsRecommendationCommitted(matchedRecommendation?.id ?? "");
  const showForecastBadge = !!matchedRecommendation && !committed;
  return (
    <div
      className={cn(
        "group relative rounded-lg border border-border border-l-4 p-2.5 transition-colors hover:bg-muted/60",
        CATEGORY_TINT[session.category] ?? "",
      )}
    >
      {showForecastBadge && matchedRecommendation && (
        <AIFlashBadge onClick={() => setId(matchedRecommendation.id)} />
      )}
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0 truncate font-display text-sm font-semibold">
          {session.name}
        </div>
        <div className="num shrink-0 text-[11px] text-muted-foreground">
          {formatHour(session.startHour)}
        </div>
      </div>
      {!compact && (
        <div className="mt-1 truncate text-[11px] text-muted-foreground">
          {instructor?.name}
        </div>
      )}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full",
              pct >= 100 ? "bg-destructive" : pct >= 85 ? "bg-accent" : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="num text-[11px] tabular-nums text-foreground">
          {session.booked}/{session.capacity}
        </span>
      </div>
    </div>
  );
}
