import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DEFAULT_RECOMMENDATION, computeOutcome, solveSeatsAndPriceForSentiment } from "@/lib/capacity-model";
import { RecommendationPanel } from "./RecommendationPanel";
import { LinkedControls } from "./LinkedControls";

export function ForecastSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const recommendation = DEFAULT_RECOMMENDATION;
  const [seats, setSeats] = useState(recommendation.defaults.seats);
  const [price, setPrice] = useState(recommendation.defaults.price);
  const [sentiment, setSentiment] = useState(recommendation.defaults.sentiment);

  function handleSeatsChange(value: number) {
    setSeats(value);
    setSentiment(computeOutcome({ seats: value, price }).sentiment);
  }

  function handlePriceChange(value: number) {
    setPrice(value);
    setSentiment(computeOutcome({ seats, price: value }).sentiment);
  }

  function handleSentimentChange(value: number) {
    const next = solveSeatsAndPriceForSentiment(value, { seats, price });
    setSeats(next.seats);
    setPrice(next.price);
    setSentiment(computeOutcome(next).sentiment);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Capacity forecast</DialogTitle>
          <DialogDescription>Saturday demand is outpacing supply for this class.</DialogDescription>
        </DialogHeader>

        <RecommendationPanel recommendation={recommendation} />
        <LinkedControls
          seats={seats}
          price={price}
          sentiment={sentiment}
          onSeatsChange={handleSeatsChange}
          onPriceChange={handlePriceChange}
          onSentimentChange={handleSentimentChange}
        />
      </DialogContent>
    </Dialog>
  );
}
