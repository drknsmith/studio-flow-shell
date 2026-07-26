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
  defaults: { seats: number; price: number; sentiment: number; capacityPct: number };
}

export interface OutcomeInput {
  seats: number;
  price: number;
  /** Projected fill rate, 0-100. Defaults to a price-derived estimate when omitted. */
  capacityPct?: number;
}

export interface Outcome {
  projectedRevenue: number;
  sentiment: number;
}

export const SEATS_RANGE = { min: 4, max: 40 };
export const PRICE_RANGE = { min: 10, max: 60 };

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

/** Raising price or adding seats both cost a bit of atmosphere — pricier classes feel
 *  more exclusive but less accessible; more seats dilute the room past a comfortable size. */
export function sentimentFromSeatsPrice(seats: number, price: number): number {
  const priceEffect = (price - BASELINE_PRICE) * 1.1;
  const seatsEffect = Math.max(0, seats - BASELINE_SEATS) * 0.6;
  return Math.round(clamp(82 - priceEffect - seatsEffect, 0, 100));
}

/** Higher prices thin out the fill rate a little — kept linear and mild since this is a demo. */
export function fillRateFromPrice(price: number): number {
  const delta = price - BASELINE_PRICE;
  return clamp(0.92 - delta * 0.01, 0.35, 0.98);
}

export function computeOutcome({ seats, price, capacityPct }: OutcomeInput): Outcome {
  const fillRate = capacityPct != null ? clamp(capacityPct, 0, 100) / 100 : fillRateFromPrice(price);
  const projectedRevenue = Math.round(seats * price * fillRate);
  const sentiment = sentimentFromSeatsPrice(seats, price);
  return { projectedRevenue, sentiment };
}

/** Sentiment dragged directly is a target, not an output — nudge price down/up and seats
 *  in/out toward whatever combination would produce it, splitting the movement between both. */
export function solveSeatsAndPriceForSentiment(
  targetSentiment: number,
  current: { seats: number; price: number },
): { seats: number; price: number } {
  const currentSentiment = sentimentFromSeatsPrice(current.seats, current.price);
  const diff = clamp(targetSentiment, 0, 100) - currentSentiment;
  const price = clamp(Math.round(current.price - diff * 0.35), PRICE_RANGE.min, PRICE_RANGE.max);
  const seats = clamp(Math.round(current.seats - diff * 0.2), SEATS_RANGE.min, SEATS_RANGE.max);
  return { seats, price };
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
      sentiment: sentimentFromSeatsPrice(suggestedCapacity, suggestedPrice),
      capacityPct: Math.round(fillRateFromPrice(suggestedPrice) * 100),
    },
  };
}

export const DEFAULT_RECOMMENDATION = buildRecommendation(getForecastTarget());
