import { getTodaysClasses, getInstructor, formatHour } from "@/lib/mock-data";
import { CapacityBar } from "@/components/schedule/CapacityBar";
import { Card } from "@/components/ui/card";

export function TodayScheduleList() {
  const classes = getTodaysClasses();
  return (
    <Card className="overflow-hidden rounded-2xl border-border bg-card p-0 shadow-none">
      <div className="flex items-baseline justify-between border-b border-border px-5 py-4">
        <h2 className="font-display text-xl font-semibold">Today's schedule</h2>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          {classes.length} classes
        </span>
      </div>
      <ul className="divide-y divide-border">
        {classes.map((c) => {
          const instructor = getInstructor(c.instructorId);
          return (
            <li
              key={c.id}
              className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5"
            >
              <div className="num text-lg leading-none text-foreground">
                {formatHour(c.startHour)}
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-base font-semibold">
                  {c.name}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {instructor?.name} · {c.room}
                </div>
              </div>
              <CapacityBar booked={c.booked} capacity={c.capacity} />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
