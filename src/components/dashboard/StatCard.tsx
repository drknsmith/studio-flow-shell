import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <Card className="flex flex-col justify-between gap-4 rounded-2xl border-border bg-card p-5 shadow-none">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-lg",
            accent
              ? "bg-accent/20 text-accent-foreground"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div>
        <div className="num text-4xl leading-none md:text-5xl">{value}</div>
        {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
      </div>
    </Card>
  );
}
