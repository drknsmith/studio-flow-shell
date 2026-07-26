// Pure, small forecasting math for the demo — no backend, no target-specific state, just
// simple, explainable formulas shared by every recommendation's interactive sliders.
// Phase 2 can swap the internals for a real model without touching the UI.

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
