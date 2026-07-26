import type { ClientStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STYLES: Record<ClientStatus, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  lapsing: "bg-accent/25 text-accent-foreground border-accent/40",
  "at-risk": "bg-destructive/10 text-destructive border-destructive/25",
};

const LABELS: Record<ClientStatus, string> = {
  active: "Active",
  lapsing: "Lapsing",
  "at-risk": "At risk",
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        STYLES[status],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" && "bg-primary",
          status === "lapsing" && "bg-accent",
          status === "at-risk" && "bg-destructive",
        )}
      />
      {LABELS[status]}
    </span>
  );
}
