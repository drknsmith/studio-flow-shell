import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DAY_NAMES_FULL, formatHour, getInstructor } from "@/lib/mock-data";
import type { UnderperformingRecommendation } from "@/lib/recommendations";
import { commitUnderperformingRecommendation, useIsRecommendationCommitted } from "@/hooks/use-forecast";

function buildEmailDraft(rec: UnderperformingRecommendation): string {
  const dayName = DAY_NAMES_FULL[rec.dayOfWeek - 1];
  const time = formatHour(rec.target.startHour);
  const currentInstructor = getInstructor(rec.target.instructorId)?.name ?? "the current instructor";
  switch (rec.fixType) {
    case "time": {
      const newTime = rec.proposal.newStartHour != null ? formatHour(rec.proposal.newStartHour) : rec.proposal.label;
      return `Hi there,\n\nWe're moving ${rec.target.name} on ${dayName}s from ${time} to ${newTime} to better match when clients actually show up. Your existing bookings will move automatically — let us know if the new time doesn't work for you.\n\nSee you soon,\nThe studio team`;
    }
    case "instructor":
      return `Hi there,\n\nStarting this week, ${rec.target.name} on ${dayName}s at ${time} will be taught by ${rec.proposal.label} instead of ${currentInstructor}. Your existing bookings aren't affected.\n\nSee you soon,\nThe studio team`;
    case "classType":
      return `Hi there,\n\nWe're replacing ${rec.target.name} on ${dayName}s at ${time} with ${rec.proposal.label} — a better fit for this slot based on attendance patterns. Your existing bookings will move to the new format automatically.\n\nSee you soon,\nThe studio team`;
  }
}

function buildCommittedToast(rec: UnderperformingRecommendation): string {
  switch (rec.fixType) {
    case "time":
      return `${rec.target.name} moved to ${rec.proposal.label}.`;
    case "instructor":
      return `${rec.proposal.label} notified: now teaching ${rec.target.name}.`;
    case "classType":
      return `${rec.target.name} replaced with ${rec.proposal.label}.`;
  }
}

export function UnderperformingCommitPanel({ recommendation }: { recommendation: UnderperformingRecommendation }) {
  const committed = useIsRecommendationCommitted(recommendation.id);
  const [emailSent, setEmailSent] = useState(false);
  const [emailDraft, setEmailDraft] = useState(() => buildEmailDraft(recommendation));

  function handleProceed() {
    commitUnderperformingRecommendation(recommendation.id);
    toast.success(buildCommittedToast(recommendation));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(emailDraft);
      toast("Email copied to clipboard");
    } catch {
      toast("Couldn't copy — select the text and copy manually");
    }
  }

  function handleMarkSent() {
    setEmailSent(true);
    toast.success("Email marked as sent");
  }

  return (
    <div className="space-y-3">
      <Button onClick={handleProceed} disabled={committed}>
        {committed ? "Plan committed" : "Proceed with this plan"}
      </Button>

      {committed && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <div className="text-sm font-medium text-foreground">Client email draft</div>
            <span className="text-right text-[11px] text-muted-foreground">
              Demo only, no email is actually sent
            </span>
          </div>
          <Textarea
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            rows={6}
            className="text-sm"
          />
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleMarkSent} disabled={emailSent}>
              {emailSent ? "Marked as sent" : "Mark as sent"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
