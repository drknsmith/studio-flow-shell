import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { InstructorCard } from "@/components/staff/InstructorCard";
import { InstructorAvatar } from "@/components/staff/InstructorAvatar";
import { AvailabilityGrid } from "@/components/staff/AvailabilityGrid";
import {
  INSTRUCTORS,
  CLASSES,
  DAY_NAMES,
  formatHour,
  getUpcomingClassesForInstructor,
  getWeekDates,
  toDateISO,
} from "@/lib/mock-data";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/staff")({
  head: () => ({
    meta: [
      { title: "Staff — Studio" },
      { name: "description", content: "Instructor roster, weekly availability, and upcoming assignments." },
      { property: "og:title", content: "Staff — Studio" },
      { property: "og:description", content: "Instructor availability and assignments." },
    ],
  }),
  component: StaffPage,
});

function StaffPage() {
  const [selectedId, setSelectedId] = useState(INSTRUCTORS[0].id);
  const selected = INSTRUCTORS.find((i) => i.id === selectedId)!;
  const upcoming = getUpcomingClassesForInstructor(selectedId, 6);

  const thisWeekISOs = new Set(getWeekDates(0).map(toDateISO));
  const weeklyCounts = Object.fromEntries(
    INSTRUCTORS.map((i) => [
      i.id,
      CLASSES.filter((c) => c.instructorId === i.id && thisWeekISOs.has(c.dateISO)).length,
    ]),
  );

  return (
    <>
      <PageHeader title="Staff" subtitle={`${INSTRUCTORS.length} instructors`} />
      <div className="px-4 py-6 md:px-8 md:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-2">
            {INSTRUCTORS.map((i) => (
              <InstructorCard
                key={i.id}
                instructor={i}
                active={i.id === selectedId}
                onClick={() => setSelectedId(i.id)}
                weeklyClasses={weeklyCounts[i.id]}
              />
            ))}
          </aside>

          <section className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <InstructorAvatar instructor={selected} size="lg" />
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    Instructor
                  </div>
                  <h2 className="font-display text-3xl font-semibold">{selected.name}</h2>
                  <div className="text-sm text-muted-foreground">
                    {selected.specialties.join(" · ")}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-display text-lg font-semibold">Weekly availability</h3>
              <AvailabilityGrid instructorId={selectedId} />
            </div>

            <div>
              <h3 className="mb-3 font-display text-lg font-semibold">Upcoming classes</h3>
              <Card className="rounded-2xl border-border p-0 shadow-none">
                <ul className="divide-y divide-border">
                  {upcoming.map((c) => (
                    <li
                      key={c.id}
                      className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-4 px-5 py-3"
                    >
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        {DAY_NAMES[c.dayOfWeek - 1]}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-display font-semibold">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatHour(c.startHour)} · {c.room}
                        </div>
                      </div>
                      <div className="num text-sm text-muted-foreground">
                        {c.booked}/{c.capacity}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
