import type { ReactNode } from "react";
import { Slider } from "@/components/ui/slider";
import { SEATS_RANGE, PRICE_RANGE } from "@/lib/capacity-model";

export function LinkedControls({
  seats,
  price,
  sentiment,
  onSeatsChange,
  onPriceChange,
  onSentimentChange,
}: {
  seats: number;
  price: number;
  sentiment: number;
  onSeatsChange: (value: number) => void;
  onPriceChange: (value: number) => void;
  onSentimentChange: (value: number) => void;
}) {
  return (
    <div className="space-y-5">
      <ControlRow label="Seats" value={`${seats}`}>
        <Slider
          min={SEATS_RANGE.min}
          max={SEATS_RANGE.max}
          step={1}
          value={[seats]}
          onValueChange={([v]) => onSeatsChange(v)}
        />
      </ControlRow>
      <ControlRow label="Price" value={`$${price}`}>
        <Slider
          min={PRICE_RANGE.min}
          max={PRICE_RANGE.max}
          step={1}
          value={[price]}
          onValueChange={([v]) => onPriceChange(v)}
        />
      </ControlRow>
      <ControlRow label="Client sentiment" value={`${sentiment}`}>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[sentiment]}
          onValueChange={([v]) => onSentimentChange(v)}
        />
      </ControlRow>
    </div>
  );
}

function ControlRow({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="num text-muted-foreground">{value}</span>
      </div>
      {children}
    </div>
  );
}
