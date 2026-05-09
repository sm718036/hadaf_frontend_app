import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { APP_ROUTES } from "@/config/routes";
import { useCurrentUser } from "@/features/auth/use-auth";
import { getAllowedInternalNavItems } from "@/features/dashboard/access-control";
import { DashboardProvider, getDashboardAccess } from "@/features/dashboard/dashboard-context";
import {
  DashboardLayout,
  toInternalLayoutActor,
} from "@/features/dashboard/dashboard-layout";
import { RoleProtectedRoute } from "@/features/dashboard/role-protected-route";

const PAGE_TITLES: Record<string, string> = {
  [APP_ROUTES.dashboardAdmin]: "Overview",
  [APP_ROUTES.dashboardAdminLeads]: "Lead Management",
  [APP_ROUTES.dashboardAdminClients]: "Clients",
  [APP_ROUTES.dashboardAdminApplications]: "Applications",
  [APP_ROUTES.dashboardAdminContent]: "Landing CMS",
  [APP_ROUTES.dashboardAdminUsers]: "User Access",
  [APP_ROUTES.dashboardAdminProfile]: "My Profile",
};

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminDashboardRoute,
});

function AdminDashboardRoute() {
  return (
    <RoleProtectedRoute area="admin">
      <AdminDashboardContent />
    </RoleProtectedRoute>
  );
}

function AdminDashboardContent() {
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  return (
    <DashboardProvider value={getDashboardAccess(currentUser)}>
      <DashboardLayout
        area="admin"
        actor={toInternalLayoutActor(currentUser)}
        navItems={getAllowedInternalNavItems(currentUser, "admin")}
        pageTitle={
          location.pathname.startsWith(`${APP_ROUTES.dashboardAdminLeads}/`)
            ? "Lead Details"
            : location.pathname.startsWith(`${APP_ROUTES.dashboardAdminClients}/`)
              ? "Client Details"
              : location.pathname.startsWith(`${APP_ROUTES.dashboardAdminApplications}/`)
                ? "Application Details"
              : PAGE_TITLES[location.pathname] || "Admin Dashboard"
        }
      >
        <Outlet />
      </DashboardLayout>
    </DashboardProvider>
  );
}
