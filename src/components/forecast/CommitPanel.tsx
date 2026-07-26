import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DAY_NAMES_FULL, formatHour, getInstructor } from "@/lib/mock-data";
import type { RecommendedSession } from "@/lib/capacity-model";

export function CommitPanel({
  newSession,
  instructorId,
  adjusted,
  onProceed,
  onReset,
}: {
  newSession: RecommendedSession;
  instructorId: string | null;
  adjusted: boolean;
  onProceed: () => void;
  onReset: () => void;
}) {
  const dayName = DAY_NAMES_FULL[newSession.dayOfWeek - 1];
  const timeLabel = formatHour(newSession.startHour);
  const instructor = instructorId ? getInstructor(instructorId) : undefined;

  const [committed, setCommitted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailDraft, setEmailDraft] = useState(
    `Hi there,\n\nWe're adding a new ${newSession.name} session on ${dayName}s at ${timeLabel} to open up more spots for this class. Your existing bookings aren't affected — this is simply a new time to choose from.\n\nSee you soon,\nThe studio team`,
  );

  function handleProceed() {
    onProceed();
    setCommitted(true);
    toast.success(`${instructor?.name ?? "Instructor"} notified: new class ${dayName}, ${timeLabel}.`);
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
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleProceed} disabled={committed}>
          {committed ? "Plan committed" : "Proceed with this plan"}
        </Button>
        {adjusted && !committed && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Adjust and reconsider
          </Button>
        )}
      </div>

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
