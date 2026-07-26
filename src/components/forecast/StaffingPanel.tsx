import { AVAILABILITY, INSTRUCTORS, getInstructor, type Instructor } from "@/lib/mock-data";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// AVAILABILITY only has entries for these even hours (see AvailabilityGrid.tsx) —
// snap the recommended slot to the nearest one before looking it up.
const AVAILABILITY_HOURS = [6, 8, 10, 12, 14, 16, 18, 20];

export function nearestAvailabilityHour(hour: number): number {
  return AVAILABILITY_HOURS.reduce((best, h) => (Math.abs(h - hour) < Math.abs(best - hour) ? h : best));
}

export function getAvailableInstructors(dayOfWeek: number, startHour: number): Instructor[] {
  const slotKey = `${dayOfWeek}-${nearestAvailabilityHour(startHour)}`;
  return INSTRUCTORS.filter((ins) => AVAILABILITY[ins.id]?.slots[slotKey] === "available");
}

export function StaffingPanel({
  availableInstructors,
  selectedInstructorId,
  onSelectInstructor,
}: {
  availableInstructors: Instructor[];
  selectedInstructorId: string | null;
  onSelectInstructor: (id: string | null) => void;
}) {
  const selected = selectedInstructorId ? getInstructor(selectedInstructorId) : undefined;

  return (
    <div>
      <div className="mb-2 text-sm font-medium text-foreground">Staffing</div>
      {selected ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
          <span className="text-sm">{selected.name}</span>
          <button
            type="button"
            onClick={() => onSelectInstructor(null)}
            className="text-muted-foreground transition-colors hover:text-foreground"
            title="Remove instructor"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove instructor</span>
          </button>
        </div>
      ) : availableInstructors.length === 0 ? (
        <p className="text-sm text-muted-foreground">No instructors available at this time.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {availableInstructors.map((ins) => (
            <Button key={ins.id} variant="outline" size="sm" onClick={() => onSelectInstructor(ins.id)}>
              + {ins.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
