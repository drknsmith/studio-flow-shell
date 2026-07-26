import { cn } from "@/lib/utils";

export function CapacityBar({
  booked,
  capacity,
  size = "sm",
}: {
  booked: number;
  capacity: number;
  size?: "sm" | "md";
}) {
  const pct = capacity ? Math.min(100, Math.round((booked / capacity) * 100)) : 0;
  const full = pct >= 100;
  const near = pct >= 85;
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-muted",
          size === "sm" ? "h-1.5 w-16" : "h-2 w-24",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            full ? "bg-destructive" : near ? "bg-accent" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="num text-sm tabular-nums text-foreground">
        {booked}/{capacity}
      </span>
    </div>
  );
}
