// Central mock data source. Selector functions below hide the shape so Phase 2
// can swap these for real fetchers without touching UI components.

export type ClassCategory = "yoga" | "pilates" | "cycle" | "hiit" | "barre" | "meditation" | "strength";

export type Instructor = {
  id: string;
  name: string;
  initials: string;
  specialties: ClassCategory[];
  avatarColor: string; // seed for avatar
};

export type ClassSession = {
  id: string;
  name: string;
  category: ClassCategory;
  instructorId: string;
  /** Calendar date this instance runs on, YYYY-MM-DD (local). Source of truth — dayOfWeek is derived from it. */
  dateISO: string;
  /** ISO day-of-week 1..7 (Mon..Sun), derived from dateISO. Kept for components that group/label by weekday. */
  dayOfWeek: number;
  /** 24h hour, decimal ok (e.g. 6.5 = 6:30) */
  startHour: number;
  durationMin: number;
  capacity: number;
  booked: number;
  price: number;
  room: string;
};

export type MembershipType = "Unlimited" | "10-Pack" | "Drop-in" | "Class Pass" | "Founding";
export type ClientStatus = "active" | "lapsing" | "at-risk";

export type Booking = {
  id: string;
  classId: string;
  dateISO: string;
  status: "attended" | "no-show" | "cancelled" | "upcoming";
};

export type Client = {
  id: string;
  name: string;
  email: string;
  membershipType: MembershipType;
  creditsRemaining: number;
  lastVisitISO: string;
  status: ClientStatus;
  joinedISO: string;
  bookings: Booking[];
};

export type AvailabilityStatus = "available" | "booked" | "unavailable";
export type WeeklyAvailability = {
  /** map: `${dayOfWeek}-${hour}` -> status */
  slots: Record<string, AvailabilityStatus>;
};

export const INSTRUCTORS: Instructor[] = [
  { id: "i1", name: "Nora Alderman", initials: "NA", specialties: ["yoga", "meditation"], avatarColor: "155" },
  { id: "i2", name: "Marcus Vale", initials: "MV", specialties: ["hiit", "strength"], avatarColor: "78" },
  { id: "i3", name: "Priya Ranjan", initials: "PR", specialties: ["pilates", "barre"], avatarColor: "170" },
  { id: "i4", name: "Elena Cross", initials: "EC", specialties: ["cycle", "hiit"], avatarColor: "45" },
  { id: "i5", name: "Theo Bishop", initials: "TB", specialties: ["yoga", "barre"], avatarColor: "140" },
  { id: "i6", name: "Sana Okafor", initials: "SO", specialties: ["strength", "hiit"], avatarColor: "60" },
  { id: "i7", name: "Julian Mora", initials: "JM", specialties: ["cycle"], avatarColor: "90" },
  { id: "i8", name: "Rhea Delaine", initials: "RD", specialties: ["pilates", "meditation"], avatarColor: "180" },
];

const CLASS_TEMPLATES: Array<Omit<ClassSession, "id" | "dateISO" | "dayOfWeek" | "booked" | "instructorId"> & { instructorPool: string[]; bookRange: [number, number] }> = [
  { name: "Sunrise Flow", category: "yoga", startHour: 6, durationMin: 60, capacity: 20, price: 28, room: "Studio A", instructorPool: ["i1", "i5"], bookRange: [10, 20] },
  { name: "Power Pilates", category: "pilates", startHour: 7.5, durationMin: 50, capacity: 14, price: 32, room: "Studio B", instructorPool: ["i3", "i8"], bookRange: [8, 14] },
  { name: "HIIT 45", category: "hiit", startHour: 9, durationMin: 45, capacity: 18, price: 30, room: "Studio A", instructorPool: ["i2", "i6"], bookRange: [12, 18] },
  { name: "Ride Rhythm", category: "cycle", startHour: 10.5, durationMin: 45, capacity: 22, price: 32, room: "Cycle Room", instructorPool: ["i4", "i7"], bookRange: [14, 22] },
  { name: "Barre Sculpt", category: "barre", startHour: 12, durationMin: 55, capacity: 16, price: 30, room: "Studio B", instructorPool: ["i3", "i5"], bookRange: [6, 16] },
  { name: "Strength Lab", category: "strength", startHour: 17, durationMin: 60, capacity: 12, price: 34, room: "Strength Floor", instructorPool: ["i2", "i6"], bookRange: [7, 12] },
  { name: "Evening Flow", category: "yoga", startHour: 18.5, durationMin: 75, capacity: 24, price: 28, room: "Studio A", instructorPool: ["i1", "i5"], bookRange: [15, 24] },
  { name: "Stillness", category: "meditation", startHour: 20, durationMin: 30, capacity: 20, price: 18, room: "Studio C", instructorPool: ["i1", "i8"], bookRange: [4, 14] },
];

function seeded(n: number) {
  // deterministic pseudo-random
  let x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// --- Date helpers -----------------------------------------------------------

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/** YYYY-MM-DD in local time — avoids the UTC-shift footgun of Date#toISOString(). */
export function toDateISO(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // Sun=0..Sat=6
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = addDays(d, mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function formatDateShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Anchor for all generated mock dates — real "today" at module load, fixed for the session. */
const REFERENCE_WEEK_START = startOfWeek(new Date());

/** Previous, current, and next week — enough real calendar dates for paging back and forward. */
const GENERATED_WEEK_OFFSETS = [-1, 0, 1];

export function getWeekStart(weekOffset = 0): Date {
  return addDays(REFERENCE_WEEK_START, weekOffset * 7);
}

export function getWeekDates(weekOffset = 0): Date[] {
  const start = getWeekStart(weekOffset);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export const CLASSES: ClassSession[] = (() => {
  const out: ClassSession[] = [];
  let id = 0;
  GENERATED_WEEK_OFFSETS.forEach((weekOffset) => {
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const date = addDays(REFERENCE_WEEK_START, weekOffset * 7 + dayIdx);
      const dayOfWeek = dayIdx + 1; // Mon=1..Sun=7
      const dateISO = toDateISO(date);
      // Stable per-calendar-date seed component, distinct across the whole generated range
      // so different weeks' Mondays (etc.) get different random booked counts.
      const dateSeed = weekOffset * 7 + dayIdx;
      CLASS_TEMPLATES.forEach((t, i) => {
        // Sunday: lighter schedule
        if (dayOfWeek === 7 && (i === 2 || i === 5)) return;
        id++;
        const seed = dateSeed * 31 + i;
        const r = seeded(seed);
        const [lo, hi] = t.bookRange;
        const booked = Math.min(t.capacity, Math.round(lo + r * (hi - lo)));
        const instructorId = t.instructorPool[Math.floor(seeded(seed + 7) * t.instructorPool.length)];
        out.push({
          id: `c${id}`,
          name: t.name,
          category: t.category,
          instructorId,
          dateISO,
          dayOfWeek,
          startHour: t.startHour,
          durationMin: t.durationMin,
          capacity: t.capacity,
          booked,
          price: t.price,
          room: t.room,
        });
      });
    }
  });
  return out;
})();

const FIRST_NAMES = ["Amelia", "Jordan", "Sasha", "Miles", "Iris", "Owen", "Noor", "Kai", "Lena", "Ezra", "Maya", "Ravi", "Cora", "Tomás", "June", "Aisha", "Wren", "Silas", "Naomi", "Beckett", "Frida", "Otis", "Vera", "Hugo", "Ida", "Rafi", "Sana", "Milo", "Elle", "Nico", "Dara", "Ford", "Blair", "Zora", "Grey", "Isla", "Kade", "Vin", "Rosa", "Ash"];
const LAST_NAMES = ["Alvarez", "Chen", "Whitaker", "Okafor", "Delaine", "Mora", "Bishop", "Cross", "Ranjan", "Vale", "Alderman", "Petrov", "Hollins", "Nakamura", "Feld", "Iqbal", "Marsh", "Sato", "Bloom", "Ostrow"];

export const CLIENTS: Client[] = (() => {
  const memberships: MembershipType[] = ["Unlimited", "10-Pack", "Drop-in", "Class Pass", "Founding"];
  const statuses: ClientStatus[] = ["active", "active", "active", "active", "lapsing", "at-risk"];
  const now = Date.now();
  return Array.from({ length: 42 }, (_, i) => {
    const r = seeded(i + 1);
    const first = FIRST_NAMES[Math.floor(seeded(i + 11) * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(seeded(i + 23) * LAST_NAMES.length)];
    const membership = memberships[Math.floor(seeded(i + 5) * memberships.length)];
    const status = statuses[Math.floor(seeded(i + 3) * statuses.length)];
    const daysAgo = Math.floor(seeded(i + 7) * (status === "at-risk" ? 60 : status === "lapsing" ? 30 : 10));
    const credits = membership === "Unlimited" ? 999 : membership === "10-Pack" ? Math.floor(r * 10) : membership === "Founding" ? 999 : Math.floor(seeded(i + 9) * 20);
    const bookingCount = 6 + Math.floor(seeded(i + 13) * 10);
    const bookings: Booking[] = Array.from({ length: bookingCount }, (_, b) => {
      const bDays = b * 3 + Math.floor(seeded(i + b) * 2);
      const cls = CLASSES[Math.floor(seeded(i * 3 + b) * CLASSES.length)];
      const bStatus: Booking["status"] = b === 0 && seeded(i + 100) > 0.5 ? "upcoming" : seeded(i * 5 + b) > 0.85 ? "no-show" : seeded(i * 5 + b) > 0.9 ? "cancelled" : "attended";
      return {
        id: `b${i}-${b}`,
        classId: cls.id,
        dateISO: new Date(now - bDays * 86400_000).toISOString(),
        status: bStatus,
      };
    });
    return {
      id: `cl${i + 1}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}@studio.co`,
      membershipType: membership,
      creditsRemaining: credits,
      lastVisitISO: new Date(now - daysAgo * 86400_000).toISOString(),
      status,
      joinedISO: new Date(now - (90 + Math.floor(seeded(i + 15) * 500)) * 86400_000).toISOString(),
      bookings,
    };
  });
})();

const AVAILABILITY_HOURS = [6, 8, 10, 12, 14, 16, 18, 20];

function nearestAvailabilityHourOf(hour: number): number {
  return AVAILABILITY_HOURS.reduce((best, h) => (Math.abs(h - hour) < Math.abs(best - hour) ? h : best));
}

export const AVAILABILITY: Record<string, WeeklyAvailability> = (() => {
  const out: Record<string, WeeklyAvailability> = {};

  // The forecast recommendation proposes a session one hour after the target (see
  // buildRecommendation's newStartHour in capacity-model.ts) — guarantee a real staffing
  // choice by forcing a handful of non-conflicting instructors "available" right there,
  // instead of leaving it to chance whether the random generation happened to clear enough.
  const target = getForecastTarget();
  const targetDay = target.dayOfWeek;
  const targetHour = nearestAvailabilityHourOf(target.startHour + 1);
  const targetSlotKey = `${targetDay}-${targetHour}`;
  const busyAtTargetSlot = new Set(
    CLASSES.filter(c => c.dayOfWeek === targetDay && Math.floor(c.startHour) === targetHour).map(c => c.instructorId),
  );
  const eligibleForTargetSlot = INSTRUCTORS.filter(ins => !busyAtTargetSlot.has(ins.id));
  const forcedAvailableCount = Math.min(eligibleForTargetSlot.length, seeded(4242) > 0.5 ? 4 : 3);
  const forcedAvailableIds = new Set(
    eligibleForTargetSlot
      .map((ins, idx) => ({ id: ins.id, r: seeded(idx * 17 + 501) }))
      .sort((a, b) => a.r - b.r)
      .slice(0, forcedAvailableCount)
      .map(x => x.id),
  );

  INSTRUCTORS.forEach((ins, idx) => {
    const slots: Record<string, AvailabilityStatus> = {};
    for (let day = 1; day <= 7; day++) {
      for (const hour of AVAILABILITY_HOURS) {
        const key = `${day}-${hour}`;
        const teachesHere = CLASSES.some(c => c.instructorId === ins.id && c.dayOfWeek === day && Math.floor(c.startHour) === hour);
        if (teachesHere) {
          slots[key] = "booked";
        } else if (key === targetSlotKey && forcedAvailableIds.has(ins.id)) {
          slots[key] = "available";
        } else {
          const r = seeded(idx * 100 + day * 10 + hour);
          slots[key] = r > 0.7 ? "unavailable" : "available";
        }
      }
    }
    out[ins.id] = { slots };
  });
  return out;
})();

// --- Selectors ------------------------------------------------------------

export function getTodaysClasses(): ClassSession[] {
  const todayISO = toDateISO(new Date());
  return CLASSES.filter(c => c.dateISO === todayISO).sort((a, b) => a.startHour - b.startHour);
}

export function getClassesForDate(dateISO: string): ClassSession[] {
  return CLASSES.filter(c => c.dateISO === dateISO).sort((a, b) => a.startHour - b.startHour);
}

export function getInstructor(id: string): Instructor | undefined {
  return INSTRUCTORS.find(i => i.id === id);
}

export function getClientById(id: string): Client | undefined {
  return CLIENTS.find(c => c.id === id);
}

export function getUpcomingClassesForInstructor(id: string, limit = 5): ClassSession[] {
  const todayISO = toDateISO(new Date());
  return CLASSES
    .filter(c => c.instructorId === id && c.dateISO >= todayISO)
    .sort((a, b) => (a.dateISO === b.dateISO ? a.startHour - b.startHour : a.dateISO.localeCompare(b.dateISO)))
    .slice(0, limit);
}

export function getClassById(id: string): ClassSession | undefined {
  return CLASSES.find(c => c.id === id);
}

/** The upcoming Saturday session with the highest booked/capacity ratio — the forecast target.
 *  Restricted to today-or-later so the recommendation always points at an actionable, single,
 *  concrete session instance rather than an already-past date or an ambiguous weekday match. */
export function getForecastTarget(): ClassSession {
  const todayISO = toDateISO(new Date());
  const upcoming = CLASSES.filter(c => c.dayOfWeek === 6 && c.dateISO >= todayISO);
  const pool = upcoming.length > 0 ? upcoming : CLASSES.filter(c => c.dayOfWeek === 6);
  return pool.reduce((best, c) => {
    const ratio = c.booked / c.capacity;
    const bestRatio = best.booked / best.capacity;
    if (ratio > bestRatio) return c;
    if (ratio === bestRatio && c.dateISO < best.dateISO) return c;
    return best;
  });
}

// Dashboard KPIs
export function getTodayStats() {
  const today = getTodaysClasses();
  const totalBookings = today.reduce((s, c) => s + c.booked, 0);
  const totalCapacity = today.reduce((s, c) => s + c.capacity, 0);
  const capacityPct = totalCapacity ? Math.round((totalBookings / totalCapacity) * 100) : 0;
  const revenue = today.reduce((s, c) => s + c.booked * c.price, 0);
  return {
    classesCount: today.length,
    totalBookings,
    capacityPct,
    revenue,
  };
}

export function getWeeklyAttendance(): { day: string; bookings: number; capacity: number }[] {
  return getWeekDates(0).map((date, i) => {
    const cs = getClassesForDate(toDateISO(date));
    return {
      day: DAY_NAMES[i],
      bookings: cs.reduce((s, c) => s + c.booked, 0),
      capacity: cs.reduce((s, c) => s + c.capacity, 0),
    };
  });
}

export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DAY_NAMES_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function formatHour(h: number): string {
  const hour = Math.floor(h);
  const mins = Math.round((h - hour) * 60);
  const suffix = hour >= 12 ? "pm" : "am";
  const h12 = ((hour + 11) % 12) + 1;
  return mins ? `${h12}:${mins.toString().padStart(2, "0")}${suffix}` : `${h12}${suffix}`;
}
