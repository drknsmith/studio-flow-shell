import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Users, Gauge, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { TodayScheduleList } from "@/components/dashboard/TodayScheduleList";
import { WeeklyAttendanceChart } from "@/components/dashboard/WeeklyAttendanceChart";
import { getTodayStats } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Studio" },
      { name: "description", content: "Today's classes, bookings, capacity, and revenue at a glance." },
      { property: "og:title", content: "Dashboard — Studio" },
      { property: "og:description", content: "Today's classes, bookings, capacity, and revenue at a glance." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const stats = getTodayStats();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <>
      <PageHeader title="Today at the studio" subtitle={today} />
      <div className="space-y-6 px-4 py-6 md:px-8 md:py-8">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <StatCard
            label="Classes today"
            value={stats.classesCount.toString()}
            hint="On the books"
            icon={CalendarDays}
          />
          <StatCard
            label="Bookings"
            value={stats.totalBookings.toString()}
            hint="Reserved seats"
            icon={Users}
          />
          <StatCard
            label="Capacity"
            value={`${stats.capacityPct}%`}
            hint="Filled across today"
            icon={Gauge}
            accent
          />
          <StatCard
            label="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            hint="Projected, today"
            icon={DollarSign}
          />
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <TodayScheduleList />
          </div>
          <div className="lg:col-span-2">
            <WeeklyAttendanceChart />
          </div>
        </section>
      </div>
    </>
  );
}
