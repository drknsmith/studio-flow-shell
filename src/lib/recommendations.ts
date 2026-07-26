// Resolves the 13 fixed recommendation slots (recommendation-data.ts) onto real calendar
// dates. This is the only place "today" enters the recommendation system — the slot content
// itself never changes, only which live date each day-of-week maps to.

import { addDays, getWeekStart, toDateISO, type ClassCategory, type ClassSession } from "./mock-data";
import { RECOMMENDATION_SLOTS, type RecommendationSlotDef } from "./recommendation-data";

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

export interface Recommendation {
  id: string;
  recommendationType: string;
  date: Date;
  dateISO: string;
  dayOfWeek: number;
  headline: string;
  pattern: string;
  rationale: string;
  newSession: RecommendedSession;
  defaults: { seats: number; price: number; sentiment: number; capacityPct: number };
  target: RecommendationTarget;
}

function resolveSlot(slot: RecommendationSlotDef): Recommendation {
  const weekStart = getWeekStart(slot.week === "this" ? 0 : 1);
  const date = addDays(weekStart, slot.target.dayOfWeek - 1);
  const dateISO = toDateISO(date);
  return {
    id: slot.id,
    recommendationType: slot.recommendationType,
    date,
    dateISO,
    dayOfWeek: slot.target.dayOfWeek,
    headline: slot.headline,
    pattern: slot.pattern,
    rationale: slot.rationale,
    newSession: { ...slot.newSession, dateISO },
    defaults: slot.defaults,
    target: { id: `${slot.id}-target`, ...slot.target, dateISO },
  };
}

/** Recomputed on each call (cheap — 13 items) so it always reflects "today" as of the moment
 *  it's read, consistent with how the rest of the schedule resolves live dates. */
export function getResolvedRecommendations(): Recommendation[] {
  return RECOMMENDATION_SLOTS.map(resolveSlot).sort((a, b) =>
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
