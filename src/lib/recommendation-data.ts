// Fixed lookup of 13 recommendation scenarios — every field here (class, instructor, numbers,
// copy) is permanently authored content and never changes. The only thing that varies between
// page loads is which real calendar date each slot's day-of-week resolves to (see
// recommendations.ts); this file has no notion of "today" at all.

import type { ClassCategory } from "./mock-data";
import { sentimentFromSeatsPrice, fillRateFromPrice } from "./capacity-model";

export type SlotWeek = "this" | "next";

export interface RecommendationTargetInfo {
  name: string;
  category: ClassCategory;
  room: string;
  dayOfWeek: number; // 1=Mon..7=Sun
  startHour: number;
  durationMin: number;
  capacity: number;
  booked: number;
  price: number;
  instructorId: string;
}

export interface RecommendedSessionDef {
  name: string;
  category: ClassCategory;
  room: string;
  dayOfWeek: number;
  startHour: number;
  durationMin: number;
  capacity: number;
  price: number;
}

export interface RecommendationSlotDef {
  id: string;
  week: SlotWeek;
  recommendationType: string;
  target: RecommendationTargetInfo;
  headline: string;
  pattern: string;
  rationale: string;
  newSession: RecommendedSessionDef;
  defaults: { seats: number; price: number; sentiment: number; capacityPct: number };
}

function defaultsFor(seats: number, price: number) {
  return {
    seats,
    price,
    sentiment: sentimentFromSeatsPrice(seats, price),
    capacityPct: Math.round(fillRateFromPrice(price) * 100),
  };
}

export const RECOMMENDATION_SLOTS: RecommendationSlotDef[] = [
  // --- This week (7) ---------------------------------------------------
  {
    id: "slot-mon-6am-w0",
    week: "this",
    recommendationType: "Sold-out risk",
    target: { name: "Sunrise Flow", category: "yoga", room: "Studio A", dayOfWeek: 1, startHour: 6, durationMin: 60, capacity: 20, booked: 19, price: 28, instructorId: "i1" },
    headline: "Add a 7am Sunrise Flow on Mondays",
    pattern: "Sold out or waitlisted 6 of the last 8 Mondays",
    rationale: "Sunrise Flow runs 95% booked most Mondays under Nora Alderman. A 7am add-on gives early risers a second option before the 6am class fills up during the week.",
    newSession: { name: "Sunrise Flow", category: "yoga", room: "Studio A", dayOfWeek: 1, startHour: 7, durationMin: 60, capacity: 18, price: 30 },
    defaults: defaultsFor(18, 30),
  },
  {
    id: "slot-wed-5pm-w0",
    week: "this",
    recommendationType: "Peak demand",
    target: { name: "Strength Lab", category: "strength", room: "Strength Floor", dayOfWeek: 3, startHour: 17, durationMin: 60, capacity: 12, booked: 11, price: 34, instructorId: "i6" },
    headline: "Add a 6pm Strength Lab on Wednesdays",
    pattern: "Full or waitlisted 5 of the last 8 Wednesdays",
    rationale: "Strength Lab with Sana Okafor consistently books out by midweek. A 6pm session captures the after-work crowd that can't make 5pm.",
    newSession: { name: "Strength Lab", category: "strength", room: "Strength Floor", dayOfWeek: 3, startHour: 18, durationMin: 60, capacity: 12, price: 36 },
    defaults: defaultsFor(12, 36),
  },
  {
    id: "slot-thu-9am-w0",
    week: "this",
    recommendationType: "Waitlist overflow",
    target: { name: "HIIT 45", category: "hiit", room: "Studio A", dayOfWeek: 4, startHour: 9, durationMin: 45, capacity: 18, booked: 17, price: 30, instructorId: "i2" },
    headline: "Add a 10am HIIT 45 on Thursdays",
    pattern: "Waitlisted 7 of the last 8 Thursdays",
    rationale: "Marcus Vale's Thursday HIIT 45 is the tightest slot on the board. A 10am follow-on keeps the momentum going for clients turned away from 9am.",
    newSession: { name: "HIIT 45", category: "hiit", room: "Studio A", dayOfWeek: 4, startHour: 10, durationMin: 45, capacity: 16, price: 32 },
    defaults: defaultsFor(16, 32),
  },
  {
    id: "slot-thu-630pm-w0",
    week: "this",
    recommendationType: "Capacity gap",
    target: { name: "Evening Flow", category: "yoga", room: "Studio A", dayOfWeek: 4, startHour: 18.5, durationMin: 75, capacity: 24, booked: 22, price: 28, instructorId: "i5" },
    headline: "Add a 7:30pm Evening Flow on Thursdays",
    pattern: "Full or waitlisted 6 of the last 8 Thursdays",
    rationale: "Theo Bishop's Thursday Evening Flow regularly closes out early. A later 7:30pm class gives commuters a realistic window.",
    newSession: { name: "Evening Flow", category: "yoga", room: "Studio A", dayOfWeek: 4, startHour: 19.5, durationMin: 75, capacity: 20, price: 30 },
    defaults: defaultsFor(20, 30),
  },
  {
    id: "slot-fri-6am-w0",
    week: "this",
    recommendationType: "Sold-out risk",
    target: { name: "Sunrise Flow", category: "yoga", room: "Studio A", dayOfWeek: 5, startHour: 6, durationMin: 60, capacity: 20, booked: 18, price: 28, instructorId: "i5" },
    headline: "Add a 7am Sunrise Flow on Fridays",
    pattern: "Full or waitlisted 5 of the last 8 Fridays",
    rationale: "Friday's Sunrise Flow with Theo Bishop trends toward capacity by Wednesday booking. A 7am follow-on smooths the rush before the weekend.",
    newSession: { name: "Sunrise Flow", category: "yoga", room: "Studio A", dayOfWeek: 5, startHour: 7, durationMin: 60, capacity: 18, price: 30 },
    defaults: defaultsFor(18, 30),
  },
  {
    id: "slot-sun-1030am-w0",
    week: "this",
    recommendationType: "Sold-out risk",
    target: { name: "Ride Rhythm", category: "cycle", room: "Cycle Room", dayOfWeek: 7, startHour: 10.5, durationMin: 45, capacity: 22, booked: 21, price: 32, instructorId: "i4" },
    headline: "Add a 11:30am Ride Rhythm on Sundays",
    pattern: "Full or waitlisted 7 of the last 8 Sundays",
    rationale: "Elena Cross's Sunday Ride Rhythm is the studio's most reliably sold-out class. An 11:30am add-on captures riders who miss the 10:30 cutoff.",
    newSession: { name: "Ride Rhythm", category: "cycle", room: "Cycle Room", dayOfWeek: 7, startHour: 11.5, durationMin: 45, capacity: 20, price: 34 },
    defaults: defaultsFor(20, 34),
  },
  {
    id: "slot-mon-12pm-w0",
    week: "this",
    recommendationType: "Peak demand",
    target: { name: "Barre Sculpt", category: "barre", room: "Studio B", dayOfWeek: 1, startHour: 12, durationMin: 55, capacity: 16, booked: 14, price: 30, instructorId: "i3" },
    headline: "Add a 1pm Barre Sculpt on Mondays",
    pattern: "Full or waitlisted 4 of the last 8 Mondays",
    rationale: "Priya Ranjan's Monday lunchtime Barre Sculpt is trending toward capacity. A 1pm session catches the second wave of the midday rush.",
    newSession: { name: "Barre Sculpt", category: "barre", room: "Studio B", dayOfWeek: 1, startHour: 13, durationMin: 55, capacity: 14, price: 32 },
    defaults: defaultsFor(14, 32),
  },
  // --- Next week (6) -----------------------------------------------------
  {
    id: "slot-tue-9am-w1",
    week: "next",
    recommendationType: "Waitlist overflow",
    target: { name: "HIIT 45", category: "hiit", room: "Studio A", dayOfWeek: 2, startHour: 9, durationMin: 45, capacity: 18, booked: 16, price: 30, instructorId: "i6" },
    headline: "Add a 10am HIIT 45 on Tuesdays",
    pattern: "Waitlisted 5 of the last 8 Tuesdays",
    rationale: "Sana Okafor's Tuesday HIIT 45 has been trending toward a waitlist. A 10am follow-on absorbs the overflow without changing the 9am format.",
    newSession: { name: "HIIT 45", category: "hiit", room: "Studio A", dayOfWeek: 2, startHour: 10, durationMin: 45, capacity: 16, price: 32 },
    defaults: defaultsFor(16, 32),
  },
  {
    id: "slot-tue-5pm-w1",
    week: "next",
    recommendationType: "Capacity gap",
    target: { name: "Strength Lab", category: "strength", room: "Strength Floor", dayOfWeek: 2, startHour: 17, durationMin: 60, capacity: 12, booked: 10, price: 34, instructorId: "i2" },
    headline: "Add a 6pm Strength Lab on Tuesdays",
    pattern: "Full or waitlisted 4 of the last 8 Tuesdays",
    rationale: "Marcus Vale's Tuesday Strength Lab is filling out earlier each week. A 6pm session gives the after-work crowd a second entry point.",
    newSession: { name: "Strength Lab", category: "strength", room: "Strength Floor", dayOfWeek: 2, startHour: 18, durationMin: 60, capacity: 12, price: 36 },
    defaults: defaultsFor(12, 36),
  },
  {
    id: "slot-wed-12pm-w1",
    week: "next",
    recommendationType: "Sold-out risk",
    target: { name: "Barre Sculpt", category: "barre", room: "Studio B", dayOfWeek: 3, startHour: 12, durationMin: 55, capacity: 16, booked: 15, price: 30, instructorId: "i5" },
    headline: "Add a 1pm Barre Sculpt on Wednesdays",
    pattern: "Full or waitlisted 6 of the last 8 Wednesdays",
    rationale: "Theo Bishop's Wednesday Barre Sculpt is the tightest midday slot in the studio. A 1pm add-on keeps lunchtime clients from booking elsewhere.",
    newSession: { name: "Barre Sculpt", category: "barre", room: "Studio B", dayOfWeek: 3, startHour: 13, durationMin: 55, capacity: 14, price: 32 },
    defaults: defaultsFor(14, 32),
  },
  {
    id: "slot-thu-6am-w1",
    week: "next",
    recommendationType: "Peak demand",
    target: { name: "Sunrise Flow", category: "yoga", room: "Studio A", dayOfWeek: 4, startHour: 6, durationMin: 60, capacity: 20, booked: 17, price: 28, instructorId: "i1" },
    headline: "Add a 7am Sunrise Flow on Thursdays",
    pattern: "Full or waitlisted 4 of the last 8 Thursdays",
    rationale: "Nora Alderman's Thursday Sunrise Flow is creeping toward capacity. A 7am class gives early clients a second option before it sells out.",
    newSession: { name: "Sunrise Flow", category: "yoga", room: "Studio A", dayOfWeek: 4, startHour: 7, durationMin: 60, capacity: 18, price: 30 },
    defaults: defaultsFor(18, 30),
  },
  {
    id: "slot-fri-730am-w1",
    week: "next",
    recommendationType: "Sold-out risk",
    target: { name: "Power Pilates", category: "pilates", room: "Studio B", dayOfWeek: 5, startHour: 7.5, durationMin: 50, capacity: 14, booked: 13, price: 32, instructorId: "i3" },
    headline: "Add a 8:30am Power Pilates on Fridays",
    pattern: "Full or waitlisted 6 of the last 8 Fridays",
    rationale: "Priya Ranjan's Friday Power Pilates is consistently the first class to sell out. An 8:30am follow-on catches clients who miss the 7:30 cutoff.",
    newSession: { name: "Power Pilates", category: "pilates", room: "Studio B", dayOfWeek: 5, startHour: 8.5, durationMin: 50, capacity: 12, price: 34 },
    defaults: defaultsFor(12, 34),
  },
  {
    // The original single-scenario recommendation, preserved as-is.
    id: "slot-sat-10am-w1",
    week: "next",
    recommendationType: "Sold-out risk",
    target: { name: "Ride Rhythm", category: "cycle", room: "Cycle Room", dayOfWeek: 6, startHour: 10.5, durationMin: 45, capacity: 22, booked: 21, price: 32, instructorId: "i4" },
    headline: "Add a 11:30am Ride Rhythm on Saturdays",
    pattern: "Full or waitlisted in 8 of the last 8 Saturdays",
    rationale: "Ride Rhythm runs 95% booked most Saturdays. Adding a 11:30am session gives overflow demand somewhere to go before clients start booking elsewhere.",
    newSession: { name: "Ride Rhythm", category: "cycle", room: "Cycle Room", dayOfWeek: 6, startHour: 11.5, durationMin: 45, capacity: 22, price: 36 },
    defaults: defaultsFor(22, 36),
  },
];

/** Just the "current class" side of each slot — what mock-data.ts needs to guarantee real
 *  staffing options at each recommendation's proposed new-session slot. */
export const RECOMMENDATION_TARGETS: RecommendationTargetInfo[] = RECOMMENDATION_SLOTS.map(s => s.target);

// --- Underperforming-class scenarios ---------------------------------------
// The inverse workflow: a session booking under 50% gets one pre-assigned fix — move its
// time, swap its instructor, or swap the class format entirely. Never user-toggleable between
// fix types; each slot's diagnosis is fixed, authored content, same as the add-capacity slots.

export type FixType = "time" | "instructor" | "classType";

export interface UnderperformingProposal {
  /** Short label for the proposed alternative, e.g. "6:30pm, Tuesdays" / "Theo Bishop" / "Restorative Flow". */
  label: string;
  /** Supporting comparative-performance reason for this specific proposal. */
  description: string;
  /** Typical booking rate for the proposed alternative, 0-100. */
  projectedBookingPct: number;
  newDayOfWeek?: number;
  newStartHour?: number;
  newInstructorId?: string;
  newClassName?: string;
  newCategory?: ClassCategory;
  newCapacity?: number;
  newPrice?: number;
}

export interface UnderperformingSlotDef {
  id: string;
  week: SlotWeek;
  target: RecommendationTargetInfo;
  fixType: FixType;
  headline: string;
  pattern: string;
  rationale: string;
  proposal: UnderperformingProposal;
  /** Contextual client-sentiment reading for the current session — supporting info, not a lever. */
  sentimentContext: number;
}

export const UNDERPERFORMING_SLOTS: UnderperformingSlotDef[] = [
  // --- This week (3) -------------------------------------------------------
  {
    id: "underperf-tue-6am-w0",
    week: "this",
    target: { name: "Sunrise Flow", category: "yoga", room: "Studio A", dayOfWeek: 2, startHour: 6, durationMin: 60, capacity: 20, booked: 7, price: 28, instructorId: "i5" },
    fixType: "time",
    headline: "Move Sunrise Flow from 6am to 6:30pm on Tuesdays",
    pattern: "Under 40% booked in 6 of the last 8 Tuesdays",
    rationale: "Tuesday's 6am Sunrise Flow struggles to fill — early risers skip Tuesdays more than any other weekday, but evening yoga on Tuesdays consistently books out elsewhere on the schedule. Moving this session to 6:30pm keeps the same room and instructor, no new slot required.",
    proposal: {
      label: "6:30pm, Tuesdays",
      description: "Evening yoga sessions this week are averaging 78% booked — a like-for-like slot swap, not a new class.",
      projectedBookingPct: 78,
      newDayOfWeek: 2,
      newStartHour: 18.5,
      newCapacity: 20,
      newPrice: 28,
    },
    sentimentContext: 54,
  },
  {
    id: "underperf-wed-12pm-w0",
    week: "this",
    target: { name: "Barre Sculpt", category: "barre", room: "Studio B", dayOfWeek: 3, startHour: 12, durationMin: 55, capacity: 16, booked: 7, price: 30, instructorId: "i3" },
    fixType: "instructor",
    headline: "Swap Wednesday's Barre Sculpt instructor to Theo Bishop",
    pattern: "Under 50% booked in 5 of the last 8 Wednesdays",
    rationale: "Priya Ranjan's Wednesday midday Barre Sculpt has been running under capacity while Theo Bishop's Barre Sculpt sessions elsewhere on the schedule average well above 80%. Same slot, same room — just a different instructor at the front of the room.",
    proposal: {
      label: "Theo Bishop",
      description: "Theo Bishop's other Barre Sculpt sessions this week are averaging 83% booked.",
      projectedBookingPct: 83,
      newInstructorId: "i5",
    },
    sentimentContext: 61,
  },
  {
    id: "underperf-fri-8pm-w0",
    week: "this",
    target: { name: "Stillness", category: "meditation", room: "Studio C", dayOfWeek: 5, startHour: 20, durationMin: 30, capacity: 20, booked: 6, price: 18, instructorId: "i1" },
    fixType: "classType",
    headline: "Replace Friday's Stillness with Restorative Flow",
    pattern: "Under 35% booked in 6 of the last 8 Fridays",
    rationale: "Late Friday meditation is the softest booking slot on the schedule — clients want to physically unwind after the week, not sit still. A gentler, movement-based Restorative Flow in the same slot has historically outperformed pure meditation on Friday nights.",
    proposal: {
      label: "Restorative Flow",
      description: "Restorative-style formats in comparable Friday evening slots average 72% booked, more than double Stillness's current rate.",
      projectedBookingPct: 72,
      newClassName: "Restorative Flow",
      newCategory: "yoga",
      newCapacity: 18,
      newPrice: 22,
    },
    sentimentContext: 47,
  },
  // --- Next week (2) ---------------------------------------------------------
  {
    id: "underperf-sun-12pm-w1",
    week: "next",
    target: { name: "Barre Sculpt", category: "barre", room: "Studio B", dayOfWeek: 7, startHour: 12, durationMin: 55, capacity: 16, booked: 6, price: 30, instructorId: "i3" },
    fixType: "time",
    headline: "Move Sunday's Barre Sculpt from 12pm to 10am",
    pattern: "Under 45% booked in 5 of the last 8 Sundays",
    rationale: "Sunday midday competes with brunch and family plans — the slowest booking window of the weekend. Late-morning Sunday classes consistently outperform midday ones across the studio, without touching the room or instructor.",
    proposal: {
      label: "10am, Sundays",
      description: "Late-morning Sunday sessions are averaging 74% booked this month.",
      projectedBookingPct: 74,
      newDayOfWeek: 7,
      newStartHour: 10,
      newCapacity: 16,
      newPrice: 30,
    },
    sentimentContext: 58,
  },
  {
    id: "underperf-fri-8pm-w1",
    week: "next",
    target: { name: "Stillness", category: "meditation", room: "Studio C", dayOfWeek: 5, startHour: 20, durationMin: 30, capacity: 20, booked: 6, price: 18, instructorId: "i8" },
    fixType: "instructor",
    headline: "Swap Friday's Stillness instructor to Nora Alderman",
    pattern: "Under 40% booked in 6 of the last 8 Fridays",
    rationale: "Rhea Delaine's Friday night Stillness sessions are consistently the lowest-booked meditation slot of the week, while Nora Alderman's sessions earlier in the week run well ahead of capacity. Same format, same time — a calmer, more established voice for the Friday close.",
    proposal: {
      label: "Nora Alderman",
      description: "Nora Alderman's meditation sessions elsewhere this week are averaging 68% booked.",
      projectedBookingPct: 68,
      newInstructorId: "i1",
    },
    sentimentContext: 44,
  },
];
