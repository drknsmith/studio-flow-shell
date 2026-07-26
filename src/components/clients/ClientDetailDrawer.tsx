import type { Client } from "@/lib/mock-data";
import { getClassById, getInstructor, formatHour, DAY_NAMES_FULL } from "@/lib/mock-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

const STATUS_DOT = {
  attended: "bg-primary",
  upcoming: "bg-accent",
  "no-show": "bg-destructive",
  cancelled: "bg-muted-foreground",
} as const;

export function ClientDetailDrawer({
  client,
  open,
  onOpenChange,
}: {
  client: Client | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {client && (
          <>
            <SheetHeader className="text-left">
              <SheetTitle className="font-display text-2xl">{client.name}</SheetTitle>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={client.status} />
                <span className="text-xs text-muted-foreground">{client.email}</span>
              </div>
            </SheetHeader>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat label="Membership" value={client.membershipType} />
              <Stat
                label="Credits"
                value={client.creditsRemaining >= 999 ? "∞" : client.creditsRemaining.toString()}
              />
              <Stat
                label="Last visit"
                value={new Date(client.lastVisitISO).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              />
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-lg font-semibold">Booking history</h3>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {client.bookings.length} total
                </span>
              </div>
              <ul className="space-y-2">
                {client.bookings.map((b) => {
                  const cls = getClassById(b.classId);
                  const ins = cls ? getInstructor(cls.instructorId) : undefined;
                  const d = new Date(b.dateISO);
                  return (
                    <li
                      key={b.id}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                    >
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[b.status])} />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{cls?.name ?? "Class"}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {DAY_NAMES_FULL[cls ? cls.dayOfWeek - 1 : 0]} · {cls ? formatHour(cls.startHour) : ""} · {ins?.name}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div className="num">{d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
                        <div className="capitalize">{b.status}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-base font-semibold">{value}</div>
    </div>
  );
}
