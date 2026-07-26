import type { ReactNode } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { InstructorAvatar } from "@/components/staff/InstructorAvatar";
import { getInstructor } from "@/lib/mock-data";
import type { UnderperformingToggles } from "@/lib/recommendations";

export function UnderperformingLinkedControls({
  toggles,
  selectedTimeId,
  selectedInstructorId,
  selectedClassTypeId,
  sentiment,
  baselineSentiment,
  onTimeChange,
  onInstructorChange,
  onClassTypeChange,
  onSentimentChange,
}: {
  toggles: UnderperformingToggles;
  selectedTimeId: string;
  selectedInstructorId: string;
  selectedClassTypeId: string;
  sentiment: number;
  baselineSentiment: number;
  onTimeChange: (id: string) => void;
  onInstructorChange: (id: string) => void;
  onClassTypeChange: (id: string) => void;
  onSentimentChange: (value: number) => void;
}) {
  const suggestingLowerPrice = sentiment < baselineSentiment;
  const priceDelta = suggestingLowerPrice
    ? Math.min(15, Math.max(1, Math.round((baselineSentiment - sentiment) / 1.1)))
    : 0;

  return (
    <div className="space-y-5">
      <ControlRow label="Time slot">
        <ToggleGroup
          type="single"
          value={selectedTimeId}
          onValueChange={(v) => v && onTimeChange(v)}
          className="flex-wrap justify-start"
        >
          {toggles.time.map((opt) => (
            <ToggleGroupItem key={opt.id} value={opt.id} variant="outline" className="h-auto px-3 py-1.5 text-sm">
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </ControlRow>

      <ControlRow label="Instructor">
        <ToggleGroup
          type="single"
          value={selectedInstructorId}
          onValueChange={(v) => v && onInstructorChange(v)}
          className="flex-wrap justify-start"
        >
          {toggles.instructor.map((opt) => {
            const instructor = getInstructor(opt.instructorId);
            return (
              <ToggleGroupItem key={opt.id} value={opt.id} variant="outline" className="h-auto gap-2 px-3 py-1.5 text-sm">
                {instructor && <InstructorAvatar instructor={instructor} size="sm" />}
                {opt.label}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </ControlRow>

      <ControlRow label="Class type">
        <ToggleGroup
          type="single"
          value={selectedClassTypeId}
          onValueChange={(v) => v && onClassTypeChange(v)}
          className="flex-wrap justify-start"
        >
          {toggles.classType.map((opt) => (
            <ToggleGroupItem key={opt.id} value={opt.id} variant="outline" className="h-auto px-3 py-1.5 text-sm">
              {opt.className}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </ControlRow>

      <div>
        <div className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-medium text-foreground">Client sentiment</span>
          <span className="num text-muted-foreground">{sentiment}</span>
        </div>
        <Slider min={0} max={100} step={1} value={[sentiment]} onValueChange={([v]) => onSentimentChange(v)} />
        {suggestingLowerPrice && (
          <p className="mt-2 text-xs text-muted-foreground">
            Sentiment is trending below this plan's projected level — consider dropping price by ${priceDelta} to help offset it.
          </p>
        )}
      </div>
    </div>
  );
}

function ControlRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium text-foreground">{label}</div>
      {children}
    </div>
  );
}
