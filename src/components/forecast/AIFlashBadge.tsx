import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIFlashBadge({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title="AI capacity forecast available"
      className={cn(
        "absolute -right-1.5 -top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full",
        "bg-accent text-accent-foreground shadow-sm ring-2 ring-card",
        "motion-safe:animate-pulse",
        "hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-accent/60 motion-safe:animate-ping" />
      <Sparkles className="relative h-3.5 w-3.5" />
      <span className="sr-only">View AI capacity forecast</span>
    </button>
  );
}
