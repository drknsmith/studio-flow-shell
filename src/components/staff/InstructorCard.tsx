import type { Instructor } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { InstructorAvatar } from "@/components/staff/InstructorAvatar";

export function InstructorCard({
  instructor,
  active,
  onClick,
  weeklyClasses,
}: {
  instructor: Instructor;
  active?: boolean;
  onClick?: () => void;
  weeklyClasses: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-all",
        active ? "border-primary ring-2 ring-primary/20" : "hover:border-foreground/20",
      )}
    >
      <InstructorAvatar instructor={instructor} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-display font-semibold">{instructor.name}</div>
        <div className="truncate text-xs text-muted-foreground">
          {instructor.specialties.join(" · ")}
        </div>
      </div>
      <div className="text-right">
        <div className="num text-lg leading-none">{weeklyClasses}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">wk</div>
      </div>
    </button>
  );
}
