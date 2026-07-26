// Resolves the 18 fixed recommendation slots (recommendation-data.ts) onto real calendar
// dates. This is the only place "today" enters the recommendation system — the slot content
// itself never changes, only which live date each day-of-week maps to.

import { addDays, getWeekStart, toDateISO, type ClassCategory, type ClassSession } from "./mock-data";
import {
  RECOMMENDATION_SLOTS,
  UNDERPERFORMING_SLOTS,
  type RecommendationSlotDef,
  type UnderperformingSlotDef,
  type UnderperformingProposal,
  type FixType,
} from "./recommendation-data";

export type { FixType, UnderperformingProposal };

export interface RecommendedSession {
  name: string;
  category: ClassCategory;
  room: string;
  dateISO: string;
  dayOfWeek: number;
  startHour: number;
  durationMin: number;
  capacity: number;
  price: number;
}

export interface RecommendationTarget {
  id: string;
  name: string;
  category: ClassCategory;
  room: string;
  dateISO: string;
  dayOfWeek: number;
  startHour: number;
  capacity: number;
  booked: number;
  price: number;
  instructorId: string;
}

interface ResolvedBase {
  id: string;
  date: Date;
  dateISO: string;
  dayOfWeek: number;
  headline: string;
  pattern: string;
  rationale: string;
  target: RecommendationTarget;
}

export interface AddCapacityRecommendation extends ResolvedBase {
  kind: "add-capacity";
  recommendationType: string;
  newSession: RecommendedSession;
  defaults: { seats: number; price: number; sentiment: number; capacityPct: number };
}

export interface UnderperformingRecommendation extends ResolvedBase {
  kind: "underperforming";
  fixType: FixType;
  proposal: UnderperformingProposal;
  sentimentContext: number;
}

export type Recommendation = AddCapacityRecommendation | UnderperformingRecommendation;

function resolveDate(week: "this" | "next", dayOfWeek: number) {
  const weekStart = getWeekStart(week === "this" ? 0 : 1);
  const date = addDays(weekStart, dayOfWeek - 1);
  return { date, dateISO: toDateISO(date) };
}

function resolveTarget(slot: { id: string; target: RecommendationSlotDef["target"] }, dateISO: string): RecommendationTarget {
  return { id: `${slot.id}-target`, ...slot.target, dateISO };
}

function resolveAddCapacitySlot(slot: RecommendationSlotDef): AddCapacityRecommendation {
  const { date, dateISO } = resolveDate(slot.week, slot.target.dayOfWeek);
  return {
    id: slot.id,
    kind: "add-capacity",
    recommendationType: slot.recommendationType,
    date,
    dateISO,
    dayOfWeek: slot.target.dayOfWeek,
    headline: slot.headline,
    pattern: slot.pattern,
    rationale: slot.rationale,
    newSession: { ...slot.newSession, dateISO },
    defaults: slot.defaults,
    target: resolveTarget(slot, dateISO),
  };
}

function resolveUnderperformingSlot(slot: UnderperformingSlotDef): UnderperformingRecommendation {
  const { date, dateISO } = resolveDate(slot.week, slot.target.dayOfWeek);
  return {
    id: slot.id,
    kind: "underperforming",
    date,
    dateISO,
    dayOfWeek: slot.target.dayOfWeek,
    headline: slot.headline,
    pattern: slot.pattern,
    rationale: slot.rationale,
    fixType: slot.fixType,
    proposal: slot.proposal,
    sentimentContext: slot.sentimentContext,
    target: resolveTarget(slot, dateISO),
  };
}

/** Recomputed on each call (cheap — 18 items) so it always reflects "today" as of the moment
 *  it's read, consistent with how the rest of the schedule resolves live dates. */
export function getResolvedRecommendations(): Recommendation[] {
  const addCapacity = RECOMMENDATION_SLOTS.map(resolveAddCapacitySlot);
  const underperforming = UNDERPERFORMING_SLOTS.map(resolveUnderperformingSlot);
  return [...addCapacity, ...underperforming].sort((a, b) =>
    a.dateISO === b.dateISO ? a.target.startHour - b.target.startHour : a.dateISO.localeCompare(b.dateISO),
  );
}

export function getRecommendationById(id: string): Recommendation | undefined {
  return getResolvedRecommendations().find(r => r.id === id);
}

/** Is this specific real generated class the "current class" a recommendation is about? Used
 *  to place the AI flash badge on the matching Schedule grid card. */
export function getRecommendationForSession(session: ClassSession): Recommendation | undefined {
  return getResolvedRecommendations().find(r =>
    r.target.dateISO === session.dateISO &&
    Math.floor(r.target.startHour) === Math.floor(session.startHour) &&
    r.target.name === session.name,
  );
}
