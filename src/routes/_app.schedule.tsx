import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid";
import { ScheduleList } from "@/components/schedule/ScheduleList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — Studio" },
      { name: "description", content: "Weekly class schedule across the studio, by time and instructor." },
      { property: "og:title", content: "Schedule — Studio" },
      { property: "og:description", content: "Weekly class schedule across the studio." },
    ],
  }),
  component: SchedulePage,
});

function SchedulePage() {
  const [view, setView] = useState<"week" | "list">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const label = weekOffset === 0 ? "This week" : weekOffset > 0 ? `${weekOffset} week ahead` : `${Math.abs(weekOffset)} week back`;

  return (
    <>
      <PageHeader
        title="Schedule"
        subtitle="Full studio, week view"
        actions={
          <Tabs value={view} onValueChange={(v) => setView(v as "week" | "list")}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />
      <div className="space-y-4 px-4 py-6 md:px-8 md:py-8">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((n) => n - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setWeekOffset((n) => n + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-1 font-display text-lg">{label}</div>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setWeekOffset(0)}>
            Today
          </Button>
        </div>

        {view === "week" ? <ScheduleGrid /> : <ScheduleList />}
      </div>
    </>
  );
}
