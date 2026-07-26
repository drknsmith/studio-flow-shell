import { AVAILABILITY, DAY_NAMES, formatHour, type AvailabilityStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const HOURS = [6, 8, 10, 12, 14, 16, 18, 20];

const CELL: Record<AvailabilityStatus, string> = {
  available: "bg-primary/12 text-primary",
  booked: "bg-accent/30 text-accent-foreground",
  unavailable: "bg-muted text-muted-foreground/70",
};

const LABEL: Record<AvailabilityStatus, string> = {
  available: "Open",
  booked: "Booked",
  unavailable: "Off",
};

export function AvailabilityGrid({ instructorId }: { instructorId: string }) {
  const avail = AVAILABILITY[instructorId];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <LegendDot className="bg-primary/40" label="Open" />
        <LegendDot className="bg-accent" label="Booked" />
        <LegendDot className="bg-muted-foreground/30" label="Off" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <div className="grid min-w-[560px] grid-cols-[72px_repeat(7,minmax(0,1fr))]">
          <div className="border-b border-r border-border bg-muted/40 px-2 py-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            Time
          </div>
          {DAY_NAMES.map((d) => (
            <div key={d} className="border-b border-border bg-muted/40 py-2 text-center text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              {d}
            </div>
          ))}

          {HOURS.map((h) => (
            <div key={h} className="contents">
              <div className="num border-r border-b border-border px-2 py-2 text-xs text-muted-foreground">
                {formatHour(h)}
              </div>
              {DAY_NAMES.map((_, di) => {
                const s = avail?.slots[`${di + 1}-${h}`] ?? "unavailable";
                return (
                  <div
                    key={`${di}-${h}`}
                    className={cn(
                      "flex items-center justify-center border-b border-r border-border/60 py-2 text-[11px] font-medium last:border-r-0",
                      CELL[s],
                    )}
                  >
                    {LABEL[s]}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      {label}
    </span>
  );
}
