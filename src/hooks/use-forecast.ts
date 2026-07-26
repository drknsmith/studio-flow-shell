import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";
import type { ClassSession } from "@/lib/mock-data";
import { getResolvedRecommendations } from "@/lib/recommendations";

// Small module-level stores so notification state (the bell, the schedule-grid badges, the
// proactive toast, and the list/detail modals) is shared across components without prop
// drilling. Everything here is plain in-memory state — nothing is written to localStorage,
// sessionStorage, or any other persistence layer — so a fresh page load always starts clean
// with no separate reset logic needed.

let hasPendingRecommendation = true;
const pendingListeners = new Set<() => void>();

function subscribePending(listener: () => void) {
  pendingListeners.add(listener);
  return () => pendingListeners.delete(listener);
}

/** True until any recommendation has been opened (list or detail) at least once this session. */
export function useHasPendingRecommendation() {
  return useSyncExternalStore(subscribePending, () => hasPendingRecommendation);
}

function markSeen() {
  if (hasPendingRecommendation) {
    hasPendingRecommendation = false;
    pendingListeners.forEach(l => l());
  }
}

let listOpen = false;
const listOpenListeners = new Set<() => void>();

function setRecommendationListOpen(open: boolean) {
  listOpen = open;
  if (open) markSeen();
  listOpenListeners.forEach(l => l());
}

function subscribeListOpen(listener: () => void) {
  listOpenListeners.add(listener);
  return () => listOpenListeners.delete(listener);
}

/** Level one of the notification flow: the bell's collapsed-card list. */
export function useRecommendationListOpen() {
  const open = useSyncExternalStore(subscribeListOpen, () => listOpen);
  return { open, setOpen: setRecommendationListOpen };
}

let selectedRecommendationId: string | null = null;
const selectedListeners = new Set<() => void>();

function setSelectedRecommendationId(id: string | null) {
  selectedRecommendationId = id;
  if (id) markSeen();
  selectedListeners.forEach(l => l());
}

function subscribeSelected(listener: () => void) {
  selectedListeners.add(listener);
  return () => selectedListeners.delete(listener);
}

/** Level two: which single recommendation's full detail view is open, if any. */
export function useSelectedRecommendationId() {
  const id = useSyncExternalStore(subscribeSelected, () => selectedRecommendationId);
  return { id, setId: setSelectedRecommendationId };
}

const committedSessions = new Map<string, ClassSession>();
let committedSessionsSnapshot: ClassSession[] = [];
let committedIdsSnapshot: Set<string> = new Set();
const committedListeners = new Set<() => void>();

/** Each recommendation commits independently — you can proceed with several at once. */
export function commitRecommendation(recommendationId: string, session: ClassSession) {
  committedSessions.set(recommendationId, session);
  committedSessionsSnapshot = Array.from(committedSessions.values());
  committedIdsSnapshot = new Set(committedSessions.keys());
  committedListeners.forEach(l => l());
}

function subscribeCommitted(listener: () => void) {
  committedListeners.add(listener);
  return () => committedListeners.delete(listener);
}

/** All committed new sessions, for the Schedule grid to render alongside the generated ones. */
export function useCommittedSessions(): ClassSession[] {
  return useSyncExternalStore(subscribeCommitted, () => committedSessionsSnapshot);
}

export function useIsRecommendationCommitted(recommendationId: string): boolean {
  const ids = useCommittedRecommendationIds();
  return ids.has(recommendationId);
}

/** Batch form for list-filtering, so callers don't call a per-item hook inside a loop. */
export function useCommittedRecommendationIds(): Set<string> {
  return useSyncExternalStore(subscribeCommitted, () => committedIdsSnapshot);
}

/** Fires a proactive toast surfacing that recommendations are waiting, with a "View" action
 *  that opens the notification list — not confined to the bell icon alone. */
export function useForecastToast(enabled = true, delayMs = 1500) {
  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      const count = getResolvedRecommendations().length;
      if (count === 0) return;
      toast(`${count} capacity recommendation${count === 1 ? "" : "s"} ready to review`, {
        description: "Classes running close to capacity across the next two weeks.",
        action: {
          label: "View",
          onClick: () => setRecommendationListOpen(true),
        },
      });
    }, delayMs);
    return () => clearTimeout(timer);
  }, [enabled, delayMs]);
}
