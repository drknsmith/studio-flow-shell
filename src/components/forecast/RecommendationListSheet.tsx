import { ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { DAY_NAMES_FULL, formatDateShort } from "@/lib/mock-data";
import { getResolvedRecommendations, type Recommendation } from "@/lib/recommendations";
import {
  useCommittedRecommendationIds,
  useRecommendationListOpen,
  useSelectedRecommendationId,
} from "@/hooks/use-forecast";

/** Global list modal, level one of the notification flow — collapsed cards, one per active
 *  (not-yet-committed) recommendation. Tapping a card closes this and opens the detail modal. */
export function RecommendationListSheet() {
  const { open, setOpen } = useRecommendationListOpen();
  const { setId } = useSelectedRecommendationId();
  const committedIds = useCommittedRecommendationIds();
  const active = getResolvedRecommendations().filter(r => !committedIds.has(r.id));
  const isMobile = useIsMobile();

  function handleSelect(id: string) {
    setOpen(false);
    setId(id);
  }

  const body =
    active.length === 0 ? (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No active recommendations right now — nice work.
      </p>
    ) : (
      <div className="space-y-2">
        {active.map(rec => (
          <RecommendationCard key={rec.id} recommendation={rec} onOpen={() => handleSelect(rec.id)} />
        ))}
      </div>
    );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="font-display text-lg">Capacity recommendations</DrawerTitle>
            <DrawerDescription>Classes running close to capacity across the next two weeks.</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">{body}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Capacity recommendations</DialogTitle>
          <DialogDescription>Classes running close to capacity across the next two weeks.</DialogDescription>
        </DialogHeader>
        {body}
      </DialogContent>
    </Dialog>
  );
}

function RecommendationCard({ recommendation, onOpen }: { recommendation: Recommendation; onOpen: () => void }) {
  const dayAbbrev = DAY_NAMES_FULL[recommendation.dayOfWeek - 1].slice(0, 3);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/60"
    >
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {dayAbbrev} · {formatDateShort(recommendation.date)}
        </div>
        <div className="mt-0.5 truncate font-display font-semibold text-foreground">
          {recommendation.target.name}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">{recommendation.recommendationType}</div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
