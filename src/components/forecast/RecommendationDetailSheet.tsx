import { useMemo, useRef, useState } from "react";
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
import { computeOutcome, solveSeatsAndPriceForSentiment } from "@/lib/capacity-model";
import { DAY_NAMES_FULL } from "@/lib/mock-data";
import { getRecommendationById, type Recommendation } from "@/lib/recommendations";
import { commitRecommendation, useSelectedRecommendationId } from "@/hooks/use-forecast";
import { RecommendationPanel } from "./RecommendationPanel";
import { LinkedControls } from "./LinkedControls";
import { RevenuePanel } from "./RevenuePanel";
import { StaffingPanel, getAvailableInstructors } from "./StaffingPanel";
import { CommitPanel } from "./CommitPanel";

/** Global detail modal, level two of the notification flow. Wraps the actual content so the
 *  Dialog/Drawer can still play its close animation after selectedRecommendationId goes back
 *  to null — the last-known recommendation is kept around just long enough for that. */
export function RecommendationDetailSheet() {
  const { id, setId } = useSelectedRecommendationId();
  const lastRecommendation = useRef<Recommendation | null>(null);
  if (id) {
    const found = getRecommendationById(id);
    if (found) lastRecommendation.current = found;
  }
  const recommendation = lastRecommendation.current;
  if (!recommendation) return null;

  return (
    <RecommendationDetailContent
      key={recommendation.id}
      recommendation={recommendation}
      open={!!id}
      onOpenChange={(open) => !open && setId(null)}
    />
  );
}

function RecommendationDetailContent({
  recommendation,
  open,
  onOpenChange,
}: {
  recommendation: Recommendation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
    commitRecommendation(recommendation.id, {
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
  const dayName = DAY_NAMES_FULL[recommendation.dayOfWeek - 1];

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
        recommendationId={recommendation.id}
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
            <DrawerDescription>{dayName} demand is outpacing supply for {recommendation.target.name}.</DrawerDescription>
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
          <DialogDescription>{dayName} demand is outpacing supply for {recommendation.target.name}.</DialogDescription>
        </DialogHeader>
        {sections}
      </DialogContent>
    </Dialog>
  );
}
