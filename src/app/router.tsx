import { lazy, Suspense } from "react";
import { Link, Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { SpinnerTwo } from "@/components/ui/spinner";
import { APP_ROUTES } from "@/config/routes";
import { useCurrentUser } from "@/features/auth/use-auth";
import { useCurrentClient } from "@/features/client-auth/use-client-auth";
import {
  CLIENT_NAV_ITEMS,
  canAccessInternalArea,
  getAllowedInternalNavItems,
  getDefaultInternalDashboardRoute,
} from "@/features/dashboard/access-control";
import { DashboardProvider, getDashboardAccess } from "@/features/dashboard/dashboard-context";
import { ClientOverviewPage, ModuleOverview } from "@/features/dashboard/module-pages";
import {
  DashboardLayout,
  toClientLayoutActor,
  toInternalLayoutActor,
} from "@/features/dashboard/dashboard-layout";
import { RoleProtectedRoute } from "@/features/dashboard/role-protected-route";

const HomePage = lazy(() => import("@/pages/home-page").then((module) => ({ default: module.HomePage })));
const AuthPage = lazy(() => import("@/pages/auth-page").then((module) => ({ default: module.AuthPage })));
const DashboardContentPage = lazy(() =>
  import("@/pages/dashboard/content-page").then((module) => ({ default: module.DashboardContentPage })),
);
const DashboardContentRedirect = lazy(() =>
  import("@/pages/dashboard/content-page").then((module) => ({ default: module.DashboardContentRedirect })),
);
const DashboardProfilePage = lazy(() =>
  import("@/pages/dashboard/profile-page").then((module) => ({ default: module.DashboardProfilePage })),
);
const DashboardProfileRedirect = lazy(() =>
  import("@/pages/dashboard/profile-page").then((module) => ({ default: module.DashboardProfileRedirect })),
);
const DashboardUsersPage = lazy(() =>
  import("@/pages/dashboard/users-page").then((module) => ({ default: module.DashboardUsersPage })),
);
const DashboardUsersRedirect = lazy(() =>
  import("@/pages/dashboard/users-page").then((module) => ({ default: module.DashboardUsersRedirect })),
);
const LeadListPage = lazy(() =>
  import("@/features/leads/leads-ui").then((module) => ({ default: module.LeadListPage })),
);
const LeadDetailPage = lazy(() =>
  import("@/features/leads/leads-ui").then((module) => ({ default: module.LeadDetailPage })),
);
const ClientListPage = lazy(() =>
  import("@/features/clients/client-ui").then((module) => ({ default: module.ClientListPage })),
);
const ClientDetailPage = lazy(() =>
  import("@/features/clients/client-ui").then((module) => ({ default: module.ClientDetailPage })),
);
const ClientSelfProfilePage = lazy(() =>
  import("@/features/clients/client-ui").then((module) => ({ default: module.ClientSelfProfilePage })),
);
const ApplicationListPage = lazy(() =>
  import("@/features/applications/applications-ui").then((module) => ({ default: module.ApplicationListPage })),
);
const ApplicationDetailPage = lazy(() =>
  import("@/features/applications/applications-ui").then((module) => ({ default: module.ApplicationDetailPage })),
);
const ClientApplicationPage = lazy(() =>
  import("@/features/applications/applications-ui").then((module) => ({ default: module.ClientApplicationPage })),
);
const TaskListPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({ default: module.TaskListPage })),
);
const AdminOrStaffDocumentsPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({ default: module.AdminOrStaffDocumentsPage })),
);
const AdminOrStaffAppointmentsPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({ default: module.AdminOrStaffAppointmentsPage })),
);
const AdminOrStaffMessagesPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({ default: module.AdminOrStaffMessagesPage })),
);
const AdminOrStaffPaymentsPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({ default: module.AdminOrStaffPaymentsPage })),
);
const ClientPortalDocumentsPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({ default: module.ClientPortalDocumentsPage })),
);
const ClientPortalAppointmentsPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({ default: module.ClientPortalAppointmentsPage })),
);
const ClientPortalMessagesPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({ default: module.ClientPortalMessagesPage })),
);
const ClientPortalPaymentsPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({ default: module.ClientPortalPaymentsPage })),
);
const MeetingRoomPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({ default: module.MeetingRoomPage })),
);

function RouteChunkFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-12">
      <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
        <SpinnerTwo size="sm" />
        <span>Loading page...</span>
      </div>
    </div>
  );
}

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
      title="Admin Dashboard"
      description="Use this dashboard to work with leads, clients, applications, operations, and website content."
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
      description="Use this dashboard to work with assigned leads, clients, applications, and daily operations."
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
      <Suspense fallback={<RouteChunkFallback />}>
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
      </Suspense>
    </>
  );
}
