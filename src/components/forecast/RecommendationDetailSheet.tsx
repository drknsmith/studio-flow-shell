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
import {
  getRecommendationById,
  type AddCapacityRecommendation,
  type Recommendation,
  type UnderperformingRecommendation,
} from "@/lib/recommendations";
import { commitAddCapacityRecommendation, useSelectedRecommendationId } from "@/hooks/use-forecast";
import { RecommendationPanel } from "./RecommendationPanel";
import { LinkedControls } from "./LinkedControls";
import { RevenuePanel } from "./RevenuePanel";
import { StaffingPanel, getAvailableInstructors } from "./StaffingPanel";
import { CommitPanel } from "./CommitPanel";
import { UnderperformingPanel } from "./UnderperformingPanel";
import { FixComparisonPanel } from "./FixComparisonPanel";
import { UnderperformingCommitPanel } from "./UnderperformingCommitPanel";
import { UnderperformingLinkedControls } from "./UnderperformingLinkedControls";

function clamp0to100(n: number): number {
  return Math.min(100, Math.max(0, n));
}

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

  const open = !!id;
  const onOpenChange = (o: boolean) => !o && setId(null);

  if (recommendation.kind === "underperforming") {
    return (
      <UnderperformingDetailContent
        key={recommendation.id}
        recommendation={recommendation}
        open={open}
        onOpenChange={onOpenChange}
      />
    );
  }
  return (
    <AddCapacityDetailContent
      key={recommendation.id}
      recommendation={recommendation}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

function AddCapacityDetailContent({
  recommendation,
  open,
  onOpenChange,
}: {
  recommendation: AddCapacityRecommendation;
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
    commitAddCapacityRecommendation(recommendation.id, {
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

function UnderperformingDetailContent({
  recommendation,
  open,
  onOpenChange,
}: {
  recommendation: UnderperformingRecommendation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toggles } = recommendation;

  const [timeId, setTimeId] = useState(toggles.defaultTimeId);
  const [instructorId, setInstructorId] = useState(toggles.defaultInstructorId);
  const [classTypeId, setClassTypeId] = useState(toggles.defaultClassTypeId);

  const timeOpt = toggles.time.find(o => o.id === timeId) ?? toggles.time[0];
  const instructorOpt = toggles.instructor.find(o => o.id === instructorId) ?? toggles.instructor[0];
  const classTypeOpt = toggles.classType.find(o => o.id === classTypeId) ?? toggles.classType[0];

  function computeSentiment(tId: string, iId: string, cId: string) {
    const t = toggles.time.find(o => o.id === tId) ?? toggles.time[0];
    const i = toggles.instructor.find(o => o.id === iId) ?? toggles.instructor[0];
    const c = toggles.classType.find(o => o.id === cId) ?? toggles.classType[0];
    return clamp0to100(recommendation.sentimentContext + t.sentimentDelta + i.sentimentDelta + c.sentimentDelta);
  }

  const [sentiment, setSentiment] = useState(() => computeSentiment(timeId, instructorId, classTypeId));

  function handleTimeChange(id: string) {
    const opt = toggles.time.find(o => o.id === id);
    const nextInstructorId = opt?.impliedInstructorId ?? instructorId;
    setTimeId(id);
    setInstructorId(nextInstructorId);
    setSentiment(computeSentiment(id, nextInstructorId, classTypeId));
  }

  function handleInstructorChange(id: string) {
    setInstructorId(id);
    setSentiment(computeSentiment(timeId, id, classTypeId));
  }

  function handleClassTypeChange(id: string) {
    setClassTypeId(id);
    setSentiment(computeSentiment(timeId, instructorId, id));
  }

  const baselineSentiment = computeSentiment(timeId, instructorId, classTypeId);
  const currentBookingPct = Math.round((recommendation.target.booked / recommendation.target.capacity) * 100);
  const proposedBookingPct = clamp0to100(
    currentBookingPct + timeOpt.bookingPctDelta + instructorOpt.bookingPctDelta + classTypeOpt.bookingPctDelta,
  );

  const isMobile = useIsMobile();
  const dayName = DAY_NAMES_FULL[recommendation.dayOfWeek - 1];

  const sections = (
    <>
      <UnderperformingPanel recommendation={recommendation} />
      <UnderperformingLinkedControls
        toggles={toggles}
        selectedTimeId={timeId}
        selectedInstructorId={instructorId}
        selectedClassTypeId={classTypeId}
        sentiment={sentiment}
        baselineSentiment={baselineSentiment}
        onTimeChange={handleTimeChange}
        onInstructorChange={handleInstructorChange}
        onClassTypeChange={handleClassTypeChange}
        onSentimentChange={setSentiment}
      />
      <FixComparisonPanel
        recommendation={recommendation}
        timeOpt={timeOpt}
        instructorOpt={instructorOpt}
        classTypeOpt={classTypeOpt}
        proposedBookingPct={proposedBookingPct}
      />
      <UnderperformingCommitPanel
        recommendation={recommendation}
        timeOpt={timeOpt}
        instructorOpt={instructorOpt}
        classTypeOpt={classTypeOpt}
      />
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-lg">Underperforming class</DrawerTitle>
            <DrawerDescription>{dayName} bookings are running well under half capacity for {recommendation.target.name}.</DrawerDescription>
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
          <DialogTitle className="font-display text-lg">Underperforming class</DialogTitle>
          <DialogDescription>{dayName} bookings are running well under half capacity for {recommendation.target.name}.</DialogDescription>
        </DialogHeader>
        {sections}
      </DialogContent>
    </Dialog>
  );
}
