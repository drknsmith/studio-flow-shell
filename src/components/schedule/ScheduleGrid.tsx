import { useMemo } from "react";
import { CLASSES, DAY_NAMES, formatHour, formatDateShort, getWeekDates, toDateISO } from "@/lib/mock-data";
import { useCommittedForecastSession } from "@/hooks/use-forecast";
import { ClassCard } from "./ClassCard";

const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export function ScheduleGrid({ weekOffset = 0 }: { weekOffset?: number }) {
  const committedSession = useCommittedForecastSession();
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const weekDateISOs = useMemo(() => weekDates.map(toDateISO), [weekDates]);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <div className="grid min-w-[900px] grid-cols-[64px_repeat(7,minmax(0,1fr))]">
        <div className="border-b border-r border-border bg-muted/40 px-2 py-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          Time
        </div>
        {DAY_NAMES.map((d, di) => (
          <div
            key={d}
            className="border-b border-border bg-muted/40 px-3 py-2 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground"
          >
            {d}
            <span className="ml-1 normal-case tracking-normal text-muted-foreground/70">
              {formatDateShort(weekDates[di])}
            </span>
          </div>
        ))}

        {HOURS.map((h) => (
          <div key={`row-${h}`} className="contents">
            <div className="num border-r border-b border-border px-2 py-2 text-xs text-muted-foreground">
              {formatHour(h)}
            </div>
            {DAY_NAMES.map((_, di) => {
              const dateISO = weekDateISOs[di];
              const items = CLASSES.filter(
                (c) => c.dateISO === dateISO && Math.floor(c.startHour) === h,
              );
              if (committedSession && committedSession.dateISO === dateISO && Math.floor(committedSession.startHour) === h) {
                items.push(committedSession);
              }
              return (
                <div
                  key={`cell-${dateISO}-${h}`}
                  className="min-h-16 space-y-1.5 border-b border-r border-border/60 p-1.5 last:border-r-0"
                >
                  {items.map((c) => (
                    <ClassCard key={c.id} session={c} compact />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
