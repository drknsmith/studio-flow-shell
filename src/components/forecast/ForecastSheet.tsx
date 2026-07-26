import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { DEFAULT_RECOMMENDATION, computeOutcome, solveSeatsAndPriceForSentiment } from "@/lib/capacity-model";
import { setCommittedForecastSession } from "@/hooks/use-forecast";
import { RecommendationPanel } from "./RecommendationPanel";
import { LinkedControls } from "./LinkedControls";
import { RevenuePanel } from "./RevenuePanel";
import { StaffingPanel, getAvailableInstructors } from "./StaffingPanel";
import { CommitPanel } from "./CommitPanel";

export function ForecastSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const recommendation = DEFAULT_RECOMMENDATION;
  const availableInstructors = useMemo(
    () => getAvailableInstructors(recommendation.newSession.dayOfWeek, recommendation.newSession.startHour),
    [recommendation],
  );

  const [seats, setSeats] = useState(recommendation.defaults.seats);
  const [price, setPrice] = useState(recommendation.defaults.price);
  const [sentiment, setSentiment] = useState(recommendation.defaults.sentiment);
  const [capacityPct, setCapacityPct] = useState(recommendation.defaults.capacityPct);
  const [instructorId, setInstructorId] = useState<string | null>(availableInstructors[0]?.id ?? null);

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
    const finalInstructorId = instructorId ?? availableInstructors[0]?.id ?? recommendation.target.instructorId;
    setCommittedForecastSession({
      id: `forecast-${recommendation.target.id}`,
      name: recommendation.newSession.name,
      category: recommendation.newSession.category,
      instructorId: finalInstructorId,
      dateISO: recommendation.newSession.dateISO,
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

  const isMobile = useIsMobile();

  const sections = (
    <>
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
        availableInstructors={availableInstructors}
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
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-lg">Capacity forecast</DrawerTitle>
            <DrawerDescription>Saturday demand is outpacing supply for this class.</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-4 overflow-y-auto px-4 pb-6">{sections}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Capacity forecast</DialogTitle>
          <DialogDescription>Saturday demand is outpacing supply for this class.</DialogDescription>
        </DialogHeader>
        {sections}
      </DialogContent>
    </Dialog>
  );
}
