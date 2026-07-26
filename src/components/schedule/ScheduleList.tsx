import { DAY_NAMES_FULL, getClassesForDay } from "@/lib/mock-data";
import { ClassCard } from "./ClassCard";

export function ScheduleList() {
  return (
    <div className="space-y-6">
      {DAY_NAMES_FULL.map((name, i) => {
        const items = getClassesForDay(i + 1);
        return (
          <section key={name}>
            <h3 className="mb-2 font-display text-lg font-semibold">{name}</h3>
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
