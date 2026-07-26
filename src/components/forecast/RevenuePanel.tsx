import { Slider } from "@/components/ui/slider";

export function RevenuePanel({
  projectedRevenue,
  capacityPct,
  onCapacityPctChange,
}: {
  projectedRevenue: number;
  capacityPct: number;
  onCapacityPctChange: (value: number) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Projected revenue
      </div>
      <div className="num mt-1 font-display text-4xl font-semibold text-foreground">
        ${projectedRevenue.toLocaleString()}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">per session, at projected fill</div>

      <div className="mt-4">
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium text-foreground">Projected fill</span>
          <span className="num text-muted-foreground">{capacityPct}%</span>
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[capacityPct]}
          onValueChange={([v]) => onCapacityPctChange(v)}
        />
      </div>
    </div>
  );
}
