import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Toaster } from "@/components/ui/sonner";
import { RecommendationListSheet } from "@/components/forecast/RecommendationListSheet";
import { RecommendationDetailSheet } from "@/components/forecast/RecommendationDetailSheet";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <SidebarInset className="min-w-0 flex-1 bg-background">
          <div className="pb-20 md:pb-0">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
      <MobileTabBar />
      <Toaster position="top-right" />
      <RecommendationListSheet />
      <RecommendationDetailSheet />
    </SidebarProvider>
  );
}
