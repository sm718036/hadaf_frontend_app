import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { APP_ROUTES } from "@/config/routes";
import { useCurrentClient } from "@/features/client-auth/use-client-auth";
import { CLIENT_NAV_ITEMS } from "@/features/dashboard/access-control";
import {
  DashboardLayout,
  toClientLayoutActor,
} from "@/features/dashboard/dashboard-layout";
import { RoleProtectedRoute } from "@/features/dashboard/role-protected-route";

const PAGE_TITLES: Record<string, string> = {
  [APP_ROUTES.dashboardClient]: "Overview",
  [APP_ROUTES.dashboardClientProfile]: "My Profile",
  [APP_ROUTES.dashboardClientApplication]: "Application",
  [APP_ROUTES.dashboardClientDocuments]: "Documents",
  [APP_ROUTES.dashboardClientAppointments]: "Appointments",
  [APP_ROUTES.dashboardClientPayments]: "Payments",
  [APP_ROUTES.dashboardClientMessages]: "Messages",
};

export const Route = createFileRoute("/dashboard/client")({
  component: ClientDashboardRoute,
});

function ClientDashboardRoute() {
  return (
    <RoleProtectedRoute area="client">
      <ClientDashboardContent />
    </RoleProtectedRoute>
  );
}

function ClientDashboardContent() {
  const location = useLocation();
  const { data: currentClient } = useCurrentClient();

  if (!currentClient) {
    return null;
  }

  return (
    <DashboardLayout
      area="client"
      actor={toClientLayoutActor(currentClient)}
      navItems={CLIENT_NAV_ITEMS}
      pageTitle={PAGE_TITLES[location.pathname] || "Client Dashboard"}
    >
      <Outlet />
    </DashboardLayout>
  );
}
