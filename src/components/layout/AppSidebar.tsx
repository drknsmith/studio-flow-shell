import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, Users, UserCog, Leaf, Bell } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRecommendationListOpen, useHasPendingRecommendation } from "@/hooks/use-forecast";

const NAV = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Schedule", url: "/schedule", icon: CalendarDays },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Staff", url: "/staff", icon: UserCog },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { setOpen } = useRecommendationListOpen();
  const hasPendingRecommendation = useHasPendingRecommendation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="px-2 py-2">
          {!collapsed && (
            <div className="mb-1.5 truncate text-[11px] uppercase tracking-widest text-sidebar-foreground/60">
              Studio Management
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Leaf className="h-5 w-5" />
              {collapsed && hasPendingRecommendation && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-destructive" />
              )}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 truncate font-display text-lg font-semibold tracking-tight text-sidebar-foreground">
                  The Flow Studio
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="relative shrink-0 rounded-md p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {hasPendingRecommendation && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-sidebar bg-destructive" />
                  )}
                  <span className="sr-only">Notifications</span>
                </button>
              </>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="data-[active=true]:bg-sidebar-primary/15 data-[active=true]:text-sidebar-primary data-[active=true]:font-medium"
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
