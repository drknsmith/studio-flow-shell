import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  opportunity: {
    icon: TrendingUp,
    fill: "bg-success text-background",
    ping: "bg-success/60",
    label: "View AI capacity forecast",
  },
  risk: {
    icon: TrendingDown,
    fill: "bg-destructive text-destructive-foreground",
    ping: "bg-destructive/60",
    label: "View underperforming class alert",
  },
} as const;

export function AIFlashBadge({
  onClick,
  variant = "opportunity",
  className,
}: {
  onClick: () => void;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const { icon: Icon, fill, ping, label } = VARIANTS[variant];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={label}
      className={cn(
        "absolute -right-1.5 -top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full",
        fill,
        "shadow-sm ring-2 ring-card",
        "motion-safe:animate-pulse",
        "hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className={cn("pointer-events-none absolute inset-0 rounded-full motion-safe:animate-ping", ping)} />
      <Icon className="relative h-3.5 w-3.5" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
