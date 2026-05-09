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
  [APP_ROUTES.dashboardStaff]: "Overview",
  [APP_ROUTES.dashboardStaffProfile]: "My Profile",
  [APP_ROUTES.dashboardStaffLeads]: "Assigned Leads",
  [APP_ROUTES.dashboardStaffClients]: "Assigned Clients",
  [APP_ROUTES.dashboardStaffApplications]: "Applications",
  [APP_ROUTES.dashboardStaffTasks]: "Tasks",
  [APP_ROUTES.dashboardStaffDocuments]: "Documents",
  [APP_ROUTES.dashboardStaffAppointments]: "Appointments",
  [APP_ROUTES.dashboardStaffMessages]: "Messages",
};

export const Route = createFileRoute("/dashboard/staff")({
  component: StaffDashboardRoute,
});

function StaffDashboardRoute() {
  return (
    <RoleProtectedRoute area="staff">
      <StaffDashboardContent />
    </RoleProtectedRoute>
  );
}

function StaffDashboardContent() {
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  return (
    <DashboardProvider value={getDashboardAccess(currentUser)}>
      <DashboardLayout
        area="staff"
        actor={toInternalLayoutActor(currentUser)}
        navItems={getAllowedInternalNavItems(currentUser, "staff")}
        pageTitle={
          location.pathname.startsWith(`${APP_ROUTES.dashboardStaffLeads}/`)
            ? "Lead Details"
            : location.pathname.startsWith(`${APP_ROUTES.dashboardStaffClients}/`)
              ? "Client Details"
              : location.pathname.startsWith(`${APP_ROUTES.dashboardStaffApplications}/`)
                ? "Application Details"
              : PAGE_TITLES[location.pathname] || "Staff Dashboard"
        }
      >
        <Outlet />
      </DashboardLayout>
    </DashboardProvider>
  );
}
