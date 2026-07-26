import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Users, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Schedule", url: "/schedule", icon: CalendarDays },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Staff", url: "/staff", icon: UserCog },
] as const;

export function MobileTabBar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-4">
        {TABS.map((t) => {
          const active = t.url === "/" ? pathname === "/" : pathname.startsWith(t.url);
          return (
            <li key={t.url}>
              <Link
                to={t.url}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-accent" : "text-muted-foreground",
                )}
              >
                <t.icon className={cn("h-5 w-5", active && "stroke-[2.25]")} />
                <span>{t.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
