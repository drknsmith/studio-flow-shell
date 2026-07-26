import { useSyncExternalStore } from "react";
import type { ClassSession } from "@/lib/mock-data";

// Small module-level store so the committed (in-memory) forecast session is shared
// between the forecast sheet and ScheduleGrid without prop drilling — structured
// this way so other pages can read the same committed state later.

let committedSession: ClassSession | null = null;
const committedListeners = new Set<() => void>();

export function setCommittedForecastSession(session: ClassSession) {
  committedSession = session;
  committedListeners.forEach((l) => l());
}

function subscribeCommitted(listener: () => void) {
  committedListeners.add(listener);
  return () => committedListeners.delete(listener);
}

export function useCommittedForecastSession() {
  return useSyncExternalStore(subscribeCommitted, () => committedSession);
}
