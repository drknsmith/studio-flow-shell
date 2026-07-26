import { useMemo } from "react";
import { DAY_NAMES_FULL, formatDateShort, getClassesForDate, getWeekDates, toDateISO } from "@/lib/mock-data";
import { ClassCard } from "./ClassCard";

export function ScheduleList({ weekOffset = 0 }: { weekOffset?: number }) {
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  return (
    <div className="space-y-6">
      {weekDates.map((date, i) => {
        const dateISO = toDateISO(date);
        const items = getClassesForDate(dateISO);
        return (
          <section key={dateISO}>
            <h3 className="mb-2 font-display text-lg font-semibold">
              {DAY_NAMES_FULL[i]}{" "}
              <span className="text-sm font-normal text-muted-foreground">· {formatDateShort(date)}</span>
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {items.map((c) => (
                <ClassCard key={c.id} session={c} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
