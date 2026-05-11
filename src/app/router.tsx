import { Link, Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { APP_ROUTES } from "@/config/routes";
import { HomePage } from "@/pages/home-page";
import { AuthPage } from "@/pages/auth-page";
import { DashboardContentPage, DashboardContentRedirect } from "@/pages/dashboard/content-page";
import { DashboardProfilePage, DashboardProfileRedirect } from "@/pages/dashboard/profile-page";
import { DashboardUsersPage, DashboardUsersRedirect } from "@/pages/dashboard/users-page";
import { useCurrentUser } from "@/features/auth/use-auth";
import { useCurrentClient } from "@/features/client-auth/use-client-auth";
import {
  CLIENT_NAV_ITEMS,
  canAccessInternalArea,
  getAllowedInternalNavItems,
  getDefaultInternalDashboardRoute,
} from "@/features/dashboard/access-control";
import { DashboardProvider, getDashboardAccess } from "@/features/dashboard/dashboard-context";
import {
  ClientOverviewPage,
  ModuleOverview,
} from "@/features/dashboard/module-pages";
import {
  DashboardLayout,
  toClientLayoutActor,
  toInternalLayoutActor,
} from "@/features/dashboard/dashboard-layout";
import { RoleProtectedRoute } from "@/features/dashboard/role-protected-route";
import { LeadDetailPage, LeadListPage } from "@/features/leads/leads-ui";
import {
  ClientDetailPage,
  ClientListPage,
  ClientSelfProfilePage,
} from "@/features/clients/client-ui";
import {
  ApplicationDetailPage,
  ApplicationListPage,
  ClientApplicationPage,
} from "@/features/applications/applications-ui";
import {
  AdminOrStaffAppointmentsPage,
  AdminOrStaffDocumentsPage,
  AdminOrStaffMessagesPage,
  AdminOrStaffPaymentsPage,
  ClientPortalAppointmentsPage,
  ClientPortalDocumentsPage,
  MeetingRoomPage,
  ClientPortalMessagesPage,
  ClientPortalPaymentsPage,
  TaskListPage,
} from "@/features/operations/operations-ui";

const ADMIN_PAGE_TITLES: Record<string, string> = {
  [APP_ROUTES.dashboardAdmin]: "Overview",
  [APP_ROUTES.dashboardAdminLeads]: "Lead Management",
  [APP_ROUTES.dashboardAdminClients]: "Clients",
  [APP_ROUTES.dashboardAdminApplications]: "Applications",
  [APP_ROUTES.dashboardAdminTasks]: "Tasks",
  [APP_ROUTES.dashboardAdminDocuments]: "Documents",
  [APP_ROUTES.dashboardAdminAppointments]: "Appointments",
  [APP_ROUTES.dashboardAdminMessages]: "Messages",
  [APP_ROUTES.dashboardAdminMessageCall]: "Video Call",
  [APP_ROUTES.dashboardAdminPayments]: "Payments",
  [APP_ROUTES.dashboardAdminContent]: "Landing CMS",
  [APP_ROUTES.dashboardAdminUsers]: "User Access",
  [APP_ROUTES.dashboardAdminProfile]: "My Profile",
};

const STAFF_PAGE_TITLES: Record<string, string> = {
  [APP_ROUTES.dashboardStaff]: "Overview",
  [APP_ROUTES.dashboardStaffProfile]: "My Profile",
  [APP_ROUTES.dashboardStaffLeads]: "Assigned Leads",
  [APP_ROUTES.dashboardStaffClients]: "Assigned Clients",
  [APP_ROUTES.dashboardStaffApplications]: "Applications",
  [APP_ROUTES.dashboardStaffTasks]: "Tasks",
  [APP_ROUTES.dashboardStaffDocuments]: "Documents",
  [APP_ROUTES.dashboardStaffAppointments]: "Appointments",
  [APP_ROUTES.dashboardStaffMessages]: "Messages",
  [APP_ROUTES.dashboardStaffMessageCall]: "Video Call",
  [APP_ROUTES.dashboardStaffPayments]: "Payments",
};

const CLIENT_PAGE_TITLES: Record<string, string> = {
  [APP_ROUTES.dashboardClient]: "Overview",
  [APP_ROUTES.dashboardClientProfile]: "My Profile",
  [APP_ROUTES.dashboardClientApplication]: "Application",
  [APP_ROUTES.dashboardClientDocuments]: "Documents",
  [APP_ROUTES.dashboardClientAppointments]: "Appointments",
  [APP_ROUTES.dashboardClientPayments]: "Payments",
  [APP_ROUTES.dashboardClientMessages]: "Messages",
  [APP_ROUTES.dashboardClientMessageCall]: "Video Call",
};

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found.</p>
        <Link to="/" className="btn-gold mt-6">
          Go home
        </Link>
      </div>
    </div>
  );
}

function DashboardIndexRedirect() {
  const currentUserQuery = useCurrentUser();
  const currentClientQuery = useCurrentClient();

  if (currentUserQuery.isLoading || currentClientQuery.isLoading) {
    return null;
  }

  if (currentUserQuery.data) {
    return <Navigate to={getDefaultInternalDashboardRoute(currentUserQuery.data)} replace />;
  }

  if (currentClientQuery.data) {
    return <Navigate to={APP_ROUTES.dashboardClient} replace />;
  }

  return (
    <Navigate
      to={`${APP_ROUTES.auth}?mode=staff&redirect=${encodeURIComponent(APP_ROUTES.dashboard)}`}
      replace
    />
  );
}

function ClientPortalRedirect() {
  const { data: client, isLoading } = useCurrentClient();

  if (isLoading) {
    return null;
  }

  if (client) {
    return <Navigate to={APP_ROUTES.dashboardClient} replace />;
  }

  return (
    <Navigate
      to={`${APP_ROUTES.auth}?mode=client&redirect=${encodeURIComponent(APP_ROUTES.dashboardClient)}`}
      replace
    />
  );
}

function DashboardClientsRedirect() {
  const { data: currentUser, isLoading } = useCurrentUser();

  if (isLoading) {
    return null;
  }

  if (!currentUser) {
    return (
      <Navigate
        to={`${APP_ROUTES.auth}?mode=staff&redirect=${encodeURIComponent(APP_ROUTES.dashboardClients)}`}
        replace
      />
    );
  }

  return (
    <Navigate
      to={
        currentUser.role === "admin"
          ? APP_ROUTES.dashboardAdminClients
          : APP_ROUTES.dashboardStaffClients
      }
      replace
    />
  );
}

function AdminOverviewPage() {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  return (
    <ModuleOverview
      title="Administrator Access"
      description="Admins can access every dashboard area, manage user access, and work with the existing clients and landing CMS modules."
    />
  );
}

function StaffOverviewPage() {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  return (
    <ModuleOverview
      title="Counselor Workspace"
      description="Staff navigation is limited to assigned work areas. Existing client management remains wired through the current clients module, while the rest of the structure is ready for assigned-resource APIs."
    />
  );
}

function ClientDashboardOverview() {
  const { data: currentClient } = useCurrentClient();

  if (!currentClient) {
    return null;
  }

  return <ClientOverviewPage client={currentClient} />;
}

function AdminDashboardLayout() {
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  const pageTitle = location.pathname.startsWith(`${APP_ROUTES.dashboardAdminLeads}/`)
    ? "Lead Details"
    : location.pathname.startsWith(`${APP_ROUTES.dashboardAdminClients}/`)
      ? "Client Details"
      : location.pathname.startsWith(`${APP_ROUTES.dashboardAdminApplications}/`)
        ? "Application Details"
        : location.pathname.startsWith("/dashboard/admin/messages/calls/")
          ? "Video Call"
        : ADMIN_PAGE_TITLES[location.pathname] || "Admin Dashboard";

  return (
    <DashboardProvider value={getDashboardAccess(currentUser)}>
      <DashboardLayout
        area="admin"
        actor={toInternalLayoutActor(currentUser)}
        navItems={getAllowedInternalNavItems(currentUser, "admin")}
        pageTitle={pageTitle}
      >
        <Outlet />
      </DashboardLayout>
    </DashboardProvider>
  );
}

function StaffDashboardLayout() {
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  const pageTitle = location.pathname.startsWith(`${APP_ROUTES.dashboardStaffLeads}/`)
    ? "Lead Details"
    : location.pathname.startsWith(`${APP_ROUTES.dashboardStaffClients}/`)
      ? "Client Details"
      : location.pathname.startsWith(`${APP_ROUTES.dashboardStaffApplications}/`)
        ? "Application Details"
        : location.pathname.startsWith("/dashboard/staff/messages/calls/")
          ? "Video Call"
        : STAFF_PAGE_TITLES[location.pathname] || "Staff Dashboard";

  return (
    <DashboardProvider value={getDashboardAccess(currentUser)}>
      <DashboardLayout
        area="staff"
        actor={toInternalLayoutActor(currentUser)}
        navItems={getAllowedInternalNavItems(currentUser, "staff")}
        pageTitle={pageTitle}
      >
        <Outlet />
      </DashboardLayout>
    </DashboardProvider>
  );
}

function ClientDashboardLayout() {
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
      pageTitle={
        location.pathname.startsWith("/dashboard/client/messages/calls/")
          ? "Video Call"
          : CLIENT_PAGE_TITLES[location.pathname] || "Client Dashboard"
      }
    >
      <Outlet />
    </DashboardLayout>
  );
}

function AdminLeadDetailRoute() {
  const { leadId = "" } = useParams();
  return <LeadDetailPage area="admin" leadId={leadId} />;
}

function StaffLeadDetailRoute() {
  const { leadId = "" } = useParams();
  return <LeadDetailPage area="staff" leadId={leadId} />;
}

function AdminClientDetailRoute() {
  const { clientId = "" } = useParams();
  return <ClientDetailPage area="admin" clientId={clientId} />;
}

function StaffClientDetailRoute() {
  const { clientId = "" } = useParams();
  return <ClientDetailPage area="staff" clientId={clientId} />;
}

function AdminApplicationDetailRoute() {
  const { applicationId = "" } = useParams();
  return <ApplicationDetailPage area="admin" applicationId={applicationId} />;
}

function StaffApplicationDetailRoute() {
  const { applicationId = "" } = useParams();
  return <ApplicationDetailPage area="staff" applicationId={applicationId} />;
}

function ProtectedInternalLayout({ area }: { area: "admin" | "staff" }) {
  return (
    <RoleProtectedRoute area={area}>
      {area === "admin" ? <AdminDashboardLayout /> : <StaffDashboardLayout />}
    </RoleProtectedRoute>
  );
}

function ProtectedClientLayout() {
  return (
    <RoleProtectedRoute area="client">
      <ClientDashboardLayout />
    </RoleProtectedRoute>
  );
}

export function AppRouter() {
  return (
    <>
      <SeoHead />
      <Routes>
        <Route path={APP_ROUTES.home} element={<HomePage />} />
        <Route path={APP_ROUTES.auth} element={<AuthPage />} />
        <Route path={APP_ROUTES.clientPortal} element={<ClientPortalRedirect />} />
        <Route path={APP_ROUTES.dashboard} element={<DashboardIndexRedirect />} />
        <Route path={APP_ROUTES.dashboardClients} element={<DashboardClientsRedirect />} />
        <Route path={APP_ROUTES.dashboardContent} element={<DashboardContentRedirect />} />
        <Route path={APP_ROUTES.dashboardProfile} element={<DashboardProfileRedirect />} />
        <Route path={APP_ROUTES.dashboardUsers} element={<DashboardUsersRedirect />} />

        <Route path={APP_ROUTES.dashboardAdmin} element={<ProtectedInternalLayout area="admin" />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="profile" element={<DashboardProfilePage />} />
          <Route path="leads" element={<LeadListPage area="admin" />} />
          <Route path="leads/:leadId" element={<AdminLeadDetailRoute />} />
          <Route path="clients" element={<ClientListPage area="admin" />} />
          <Route path="clients/:clientId" element={<AdminClientDetailRoute />} />
          <Route path="applications" element={<ApplicationListPage area="admin" />} />
          <Route path="applications/:applicationId" element={<AdminApplicationDetailRoute />} />
          <Route path="tasks" element={<TaskListPage area="admin" />} />
          <Route path="documents" element={<AdminOrStaffDocumentsPage area="admin" />} />
          <Route path="appointments" element={<AdminOrStaffAppointmentsPage area="admin" />} />
          <Route path="messages" element={<AdminOrStaffMessagesPage area="admin" />} />
          <Route path="messages/calls/:meetingId" element={<MeetingRoomPage mode="internal" area="admin" />} />
          <Route path="payments" element={<AdminOrStaffPaymentsPage area="admin" />} />
          <Route path="content" element={<DashboardContentPage />} />
          <Route path="users" element={<DashboardUsersPage />} />
        </Route>

        <Route path={APP_ROUTES.dashboardStaff} element={<ProtectedInternalLayout area="staff" />}>
          <Route index element={<StaffOverviewPage />} />
          <Route path="profile" element={<DashboardProfilePage />} />
          <Route path="leads" element={<LeadListPage area="staff" />} />
          <Route path="leads/:leadId" element={<StaffLeadDetailRoute />} />
          <Route path="clients" element={<ClientListPage area="staff" />} />
          <Route path="clients/:clientId" element={<StaffClientDetailRoute />} />
          <Route path="applications" element={<ApplicationListPage area="staff" />} />
          <Route path="applications/:applicationId" element={<StaffApplicationDetailRoute />} />
          <Route path="tasks" element={<TaskListPage area="staff" />} />
          <Route path="documents" element={<AdminOrStaffDocumentsPage area="staff" />} />
          <Route path="appointments" element={<AdminOrStaffAppointmentsPage area="staff" />} />
          <Route path="messages" element={<AdminOrStaffMessagesPage area="staff" />} />
          <Route path="messages/calls/:meetingId" element={<MeetingRoomPage mode="internal" area="staff" />} />
          <Route path="payments" element={<AdminOrStaffPaymentsPage area="staff" />} />
        </Route>

        <Route path={APP_ROUTES.dashboardClient} element={<ProtectedClientLayout />}>
          <Route index element={<ClientDashboardOverview />} />
          <Route path="profile" element={<ClientSelfProfilePage />} />
          <Route path="application" element={<ClientApplicationPage />} />
          <Route path="documents" element={<ClientPortalDocumentsPage />} />
          <Route path="appointments" element={<ClientPortalAppointmentsPage />} />
          <Route path="payments" element={<ClientPortalPaymentsPage />} />
          <Route path="messages" element={<ClientPortalMessagesPage />} />
          <Route path="messages/calls/:meetingId" element={<MeetingRoomPage mode="client" />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
