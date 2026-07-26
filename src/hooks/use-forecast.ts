import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";
import type { ClassSession } from "@/lib/mock-data";
import { getForecastTarget } from "@/lib/mock-data";
import { DEFAULT_RECOMMENDATION } from "@/lib/capacity-model";

// Small module-level stores so the forecast sheet's open state and the committed
// (in-memory) session are shared across components without prop drilling —
// structured this way so other pages can plug into the same forecast later.

let isOpen = false;
const openListeners = new Set<() => void>();

// True until the forecast sheet has been opened at least once this session — drives the
// sidebar's notification dot so a fresh session surfaces that a recommendation is waiting.
let hasPendingRecommendation = true;
const pendingListeners = new Set<() => void>();

function setForecastSheetOpen(open: boolean) {
  isOpen = open;
  if (open && hasPendingRecommendation) {
    hasPendingRecommendation = false;
    pendingListeners.forEach((l) => l());
  }
  openListeners.forEach((l) => l());
}

function subscribeOpen(listener: () => void) {
  openListeners.add(listener);
  return () => openListeners.delete(listener);
}

export function useForecastSheetOpen() {
  const open = useSyncExternalStore(subscribeOpen, () => isOpen);
  return { open, setOpen: setForecastSheetOpen };
}

function subscribePending(listener: () => void) {
  pendingListeners.add(listener);
  return () => pendingListeners.delete(listener);
}

export function useHasPendingRecommendation() {
  return useSyncExternalStore(subscribePending, () => hasPendingRecommendation);
}

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

export function isForecastTarget(sessionId: string): boolean {
  return getForecastTarget().id === sessionId;
}

/** Fires a proactive toast surfacing the recommendation shortly after mount, with a
 *  "View" action that opens the forecast sheet — not confined to the card badge alone. */
export function useForecastToast(enabled = true, delayMs = 1500) {
  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      toast(DEFAULT_RECOMMENDATION.headline, {
        description: DEFAULT_RECOMMENDATION.pattern,
        action: {
          label: "View",
          onClick: () => setForecastSheetOpen(true),
        },
      });
    }, delayMs);
    return () => clearTimeout(timer);
  }, [enabled, delayMs]);
}
