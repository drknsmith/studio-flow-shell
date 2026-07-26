import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DEFAULT_RECOMMENDATION, computeOutcome, solveSeatsAndPriceForSentiment } from "@/lib/capacity-model";
import { setCommittedForecastSession } from "@/hooks/use-forecast";
import { RecommendationPanel } from "./RecommendationPanel";
import { LinkedControls } from "./LinkedControls";
import { RevenuePanel } from "./RevenuePanel";
import { StaffingPanel } from "./StaffingPanel";
import { CommitPanel } from "./CommitPanel";

export function ForecastSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const recommendation = DEFAULT_RECOMMENDATION;
  const [seats, setSeats] = useState(recommendation.defaults.seats);
  const [price, setPrice] = useState(recommendation.defaults.price);
  const [sentiment, setSentiment] = useState(recommendation.defaults.sentiment);
  const [capacityPct, setCapacityPct] = useState(recommendation.defaults.capacityPct);
  const [instructorId, setInstructorId] = useState<string | null>(null);

  const { projectedRevenue } = computeOutcome({ seats, price, capacityPct });

  function handleSeatsChange(value: number) {
    setSeats(value);
    setSentiment(computeOutcome({ seats: value, price }).sentiment);
  }

  function handlePriceChange(value: number) {
    setPrice(value);
    setSentiment(computeOutcome({ seats, price: value }).sentiment);
  }

  function handleSentimentChange(value: number) {
    const next = solveSeatsAndPriceForSentiment(value, { seats, price });
    setSeats(next.seats);
    setPrice(next.price);
    setSentiment(computeOutcome(next).sentiment);
  }

  function handleReset() {
    setSeats(recommendation.defaults.seats);
    setPrice(recommendation.defaults.price);
    setSentiment(recommendation.defaults.sentiment);
    setCapacityPct(recommendation.defaults.capacityPct);
  }

  function handleProceed() {
    const finalInstructorId = instructorId ?? recommendation.target.instructorId;
    setCommittedForecastSession({
      id: `forecast-${recommendation.target.id}`,
      name: recommendation.newSession.name,
      category: recommendation.newSession.category,
      instructorId: finalInstructorId,
      dayOfWeek: recommendation.newSession.dayOfWeek,
      startHour: recommendation.newSession.startHour,
      durationMin: recommendation.newSession.durationMin,
      capacity: seats,
      booked: Math.min(seats, Math.round(seats * (capacityPct / 100))),
      price,
      room: recommendation.newSession.room,
    });
  }

  const adjusted =
    seats !== recommendation.defaults.seats ||
    price !== recommendation.defaults.price ||
    sentiment !== recommendation.defaults.sentiment ||
    capacityPct !== recommendation.defaults.capacityPct;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Capacity forecast</DialogTitle>
          <DialogDescription>Saturday demand is outpacing supply for this class.</DialogDescription>
        </DialogHeader>

        <RecommendationPanel recommendation={recommendation} />
        <LinkedControls
          seats={seats}
          price={price}
          sentiment={sentiment}
          onSeatsChange={handleSeatsChange}
          onPriceChange={handlePriceChange}
          onSentimentChange={handleSentimentChange}
        />
        <RevenuePanel
          projectedRevenue={projectedRevenue}
          capacityPct={capacityPct}
          onCapacityPctChange={setCapacityPct}
        />
        <StaffingPanel
          dayOfWeek={recommendation.newSession.dayOfWeek}
          startHour={recommendation.newSession.startHour}
          selectedInstructorId={instructorId}
          onSelectInstructor={setInstructorId}
        />
        <CommitPanel
          newSession={recommendation.newSession}
          instructorId={instructorId}
          adjusted={adjusted}
          onProceed={handleProceed}
          onReset={handleReset}
        />
      </DialogContent>
    </Dialog>
  );
}
