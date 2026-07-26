import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DAY_NAMES_FULL, formatHour } from "@/lib/mock-data";
import type {
  ClassTypeToggleOption,
  InstructorToggleOption,
  TimeToggleOption,
  UnderperformingRecommendation,
} from "@/lib/recommendations";
import { commitUnderperformingRecommendation, useIsRecommendationCommitted } from "@/hooks/use-forecast";

function describeChanges(
  rec: UnderperformingRecommendation,
  timeOpt: TimeToggleOption,
  instructorOpt: InstructorToggleOption,
  classTypeOpt: ClassTypeToggleOption,
): string[] {
  const changes: string[] = [];
  if (timeOpt.id !== "current") {
    changes.push(`moving from ${formatHour(rec.target.startHour)} to ${formatHour(timeOpt.startHour)}`);
  }
  if (instructorOpt.id !== "current") {
    changes.push(`switching the instructor to ${instructorOpt.label}`);
  }
  if (classTypeOpt.id !== "current") {
    changes.push(`replacing the format with ${classTypeOpt.className}`);
  }
  return changes;
}

function buildEmailDraft(
  rec: UnderperformingRecommendation,
  timeOpt: TimeToggleOption,
  instructorOpt: InstructorToggleOption,
  classTypeOpt: ClassTypeToggleOption,
): string {
  const dayName = DAY_NAMES_FULL[rec.dayOfWeek - 1];
  const changes = describeChanges(rec, timeOpt, instructorOpt, classTypeOpt);
  if (changes.length === 0) {
    return `Hi there,\n\nWe're keeping a close eye on ${rec.target.name} on ${dayName}s — no changes for now, but we'll follow up if attendance doesn't pick up.\n\nSee you soon,\nThe studio team`;
  }
  const changeText =
    changes.length === 1 ? changes[0] : `${changes.slice(0, -1).join(", ")} and ${changes[changes.length - 1]}`;
  return `Hi there,\n\nWe're ${changeText} for ${rec.target.name} on ${dayName}s to help fill the room. Your existing bookings will move automatically — let us know if this doesn't work for you.\n\nSee you soon,\nThe studio team`;
}

function buildCommittedToast(
  rec: UnderperformingRecommendation,
  timeOpt: TimeToggleOption,
  instructorOpt: InstructorToggleOption,
  classTypeOpt: ClassTypeToggleOption,
): string {
  const changes = describeChanges(rec, timeOpt, instructorOpt, classTypeOpt);
  if (changes.length === 0) return `${rec.target.name} plan committed — no changes.`;
  return `${rec.target.name}: ${changes.join(", ")}.`;
}

export function UnderperformingCommitPanel({
  recommendation,
  timeOpt,
  instructorOpt,
  classTypeOpt,
}: {
  recommendation: UnderperformingRecommendation;
  timeOpt: TimeToggleOption;
  instructorOpt: InstructorToggleOption;
  classTypeOpt: ClassTypeToggleOption;
}) {
  const committed = useIsRecommendationCommitted(recommendation.id);
  const [emailSent, setEmailSent] = useState(false);
  const [manuallyEdited, setManuallyEdited] = useState(false);
  const computedDraft = buildEmailDraft(recommendation, timeOpt, instructorOpt, classTypeOpt);
  const [emailDraft, setEmailDraft] = useState(computedDraft);

  // Keep the draft in sync with whichever combination is selected, right up until the user
  // starts editing it by hand — then their edits win.
  useEffect(() => {
    if (!manuallyEdited) setEmailDraft(computedDraft);
  }, [computedDraft, manuallyEdited]);

  function handleProceed() {
    commitUnderperformingRecommendation(recommendation.id);
    toast.success(buildCommittedToast(recommendation, timeOpt, instructorOpt, classTypeOpt));
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
            onChange={(e) => {
              setEmailDraft(e.target.value);
              setManuallyEdited(true);
            }}
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
