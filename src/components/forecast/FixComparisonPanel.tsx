import { DAY_NAMES_FULL, formatHour, getInstructor } from "@/lib/mock-data";
import type {
  ClassTypeToggleOption,
  InstructorToggleOption,
  TimeToggleOption,
  UnderperformingRecommendation,
} from "@/lib/recommendations";

export function FixComparisonPanel({
  recommendation,
  timeOpt,
  instructorOpt,
  classTypeOpt,
  proposedBookingPct,
}: {
  recommendation: UnderperformingRecommendation;
  timeOpt: TimeToggleOption;
  instructorOpt: InstructorToggleOption;
  classTypeOpt: ClassTypeToggleOption;
  proposedBookingPct: number;
}) {
  const { target } = recommendation;
  const dayName = DAY_NAMES_FULL[target.dayOfWeek - 1];
  const currentBookingPct = Math.round((target.booked / target.capacity) * 100);
  const currentInstructorName = getInstructor(target.instructorId)?.name ?? "Unassigned";
  const proposedInstructorName = getInstructor(instructorOpt.instructorId)?.name ?? "Unassigned";

  const activeDescriptions = [timeOpt.description, instructorOpt.description, classTypeOpt.description].filter(
    (d): d is string => !!d,
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Current
          </div>
          <div className="num mt-1 font-display text-3xl font-semibold text-destructive">{currentBookingPct}%</div>
          <div className="text-xs text-muted-foreground">average booked</div>
          <div className="mt-3 space-y-0.5">
            <div className="text-sm font-medium text-foreground">{target.name}</div>
            <div className="text-xs text-muted-foreground">
              {dayName}s, {formatHour(target.startHour)} · {currentInstructorName}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-success/40 bg-success/10 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-success">This plan</div>
          <div className="num mt-1 font-display text-3xl font-semibold text-success">{proposedBookingPct}%</div>
          <div className="text-xs text-muted-foreground">projected booked</div>
          <div className="mt-3 space-y-0.5">
            <div className="text-sm font-medium text-foreground">{classTypeOpt.className}</div>
            <div className="text-xs text-muted-foreground">
              {dayName}s, {formatHour(timeOpt.startHour)} · {proposedInstructorName}
            </div>
          </div>
        </div>
      </div>
      {activeDescriptions.length > 0 ? (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {activeDescriptions.map((d) => (
            <li key={d}>• {d}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No changes selected yet — booking is projected to stay flat.</p>
      )}
    </div>
  );
}
