// Pure, small forecasting model for the demo — no backend, just simple, explainable math.
// Phase 2 can swap the internals for a real model without touching the UI.

import type { ClassCategory, ClassSession } from "./mock-data";
import { formatHour, getForecastTarget } from "./mock-data";

export interface RecommendedSession {
  name: string;
  category: ClassCategory;
  room: string;
  dayOfWeek: number;
  startHour: number;
  durationMin: number;
  capacity: number;
  price: number;
}

export interface Recommendation {
  target: ClassSession;
  headline: string;
  pattern: string;
  rationale: string;
  newSession: RecommendedSession;
  defaults: { seats: number; price: number; sentiment: number };
}

// "Neutral" seats/price anchor used to derive a sentiment score — tuned to sit
// mid-range across the studio's classes (12-24 capacity, $18-34 price).
const BASELINE_SEATS = 18;
const BASELINE_PRICE = 30;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Deterministic pseudo-history: the closer a class runs to capacity today, the more
 *  consistently it's been doing so — used only to phrase the historical pattern line. */
function weeksNearCapacity(session: ClassSession): number {
  const ratio = session.booked / session.capacity;
  return Math.round(clamp(ratio * 8, 3, 8));
}

function estimateSentiment(seats: number, price: number): number {
  const priceEffect = (price - BASELINE_PRICE) * 1.1;
  const seatsEffect = Math.max(0, seats - BASELINE_SEATS) * 0.6;
  return Math.round(clamp(82 - priceEffect - seatsEffect, 0, 100));
}

export function buildRecommendation(session: ClassSession): Recommendation {
  const weeks = weeksNearCapacity(session);
  const pct = Math.round((session.booked / session.capacity) * 100);
  const newStartHour = session.startHour + 1;
  const suggestedPrice = session.price + 4;
  const suggestedCapacity = session.capacity;

  const newSession: RecommendedSession = {
    name: session.name,
    category: session.category,
    room: session.room,
    dayOfWeek: session.dayOfWeek,
    startHour: newStartHour,
    durationMin: session.durationMin,
    capacity: suggestedCapacity,
    price: suggestedPrice,
  };

  const headline = `Add a ${formatHour(newStartHour)} ${session.name} on Saturdays`;
  const pattern = `Full or waitlisted in ${weeks} of the last 8 Saturdays`;
  const rationale = `${session.name} runs ${pct}% booked most Saturdays. Adding a ${formatHour(newStartHour)} session gives overflow demand somewhere to go before clients start booking elsewhere.`;

  return {
    target: session,
    headline,
    pattern,
    rationale,
    newSession,
    defaults: {
      seats: suggestedCapacity,
      price: suggestedPrice,
      sentiment: estimateSentiment(suggestedCapacity, suggestedPrice),
    },
  };
}

export const DEFAULT_RECOMMENDATION = buildRecommendation(getForecastTarget());
