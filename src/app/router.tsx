import { lazy, Suspense } from "react";
import { Link, Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";
import { SpinnerTwo } from "@/components/ui/spinner";
import { APP_ROUTES } from "@/config/routes";
import { ProtectedRoute } from "@/features/auth/protected-route";
import { useCurrentUser } from "@/features/auth/use-auth";
import { useCurrentClient } from "@/features/client-auth/use-client-auth";
import {
  CLIENT_NAV_ITEMS,
  getAllowedInternalNavItems,
  getDefaultInternalDashboardRoute,
} from "@/features/dashboard/access-control";
import { DashboardProvider } from "@/features/dashboard/dashboard-context";
import { getDashboardAccess } from "@/features/dashboard/dashboard-access";
import { ClientOverviewPage, ModuleOverview } from "@/features/dashboard/module-pages";
import { DashboardLayout } from "@/features/dashboard/dashboard-layout";
import { toClientLayoutActor, toInternalLayoutActor } from "@/features/dashboard/layout-actors";

const HomePage = lazy(() =>
  import("@/pages/home-page").then((module) => ({ default: module.HomePage })),
);
const AuthPage = lazy(() =>
  import("@/pages/auth-page").then((module) => ({ default: module.AuthPage })),
);
const DashboardContentPage = lazy(() =>
  import("@/pages/dashboard/content-page").then((module) => ({
    default: module.DashboardContentPage,
  })),
);
const DashboardContentRedirect = lazy(() =>
  import("@/pages/dashboard/content-page").then((module) => ({
    default: module.DashboardContentRedirect,
  })),
);
const DashboardProfilePage = lazy(() =>
  import("@/pages/dashboard/profile-page").then((module) => ({
    default: module.DashboardProfilePage,
  })),
);
const DashboardProfileRedirect = lazy(() =>
  import("@/pages/dashboard/profile-page").then((module) => ({
    default: module.DashboardProfileRedirect,
  })),
);
const DashboardUsersPage = lazy(() =>
  import("@/pages/dashboard/users-page").then((module) => ({ default: module.DashboardUsersPage })),
);
const DashboardConfigurationVaultPage = lazy(() =>
  import("@/pages/dashboard/configuration-vault-page").then((module) => ({
    default: module.DashboardConfigurationVaultPage,
  })),
);
const DashboardIntakeEnginePage = lazy(() =>
  import("@/pages/dashboard/intake-engine-page").then((module) => ({
    default: module.DashboardIntakeEnginePage,
  })),
);
const DashboardAcademicEnginePage = lazy(() =>
  import("@/pages/dashboard/academic-engine-page").then((module) => ({
    default: module.DashboardAcademicEnginePage,
  })),
);
const DashboardDigitalVaultPage = lazy(() =>
  import("@/pages/dashboard/digital-vault-page").then((module) => ({
    default: module.DashboardDigitalVaultPage,
  })),
);
const DashboardFinancialLedgerPage = lazy(() =>
  import("@/pages/dashboard/financial-ledger-page").then((module) => ({
    default: module.DashboardFinancialLedgerPage,
  })),
);
const DashboardUsersRedirect = lazy(() =>
  import("@/pages/dashboard/users-page").then((module) => ({
    default: module.DashboardUsersRedirect,
  })),
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
  import("@/features/clients/client-ui").then((module) => ({
    default: module.ClientSelfProfilePage,
  })),
);
const ApplicationListPage = lazy(() =>
  import("@/features/applications/applications-ui").then((module) => ({
    default: module.ApplicationListPage,
  })),
);
const ApplicationDetailPage = lazy(() =>
  import("@/features/applications/applications-ui").then((module) => ({
    default: module.ApplicationDetailPage,
  })),
);
const ClientApplicationPage = lazy(() =>
  import("@/features/applications/applications-ui").then((module) => ({
    default: module.ClientApplicationPage,
  })),
);
const TaskListPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({
    default: module.TaskListPage,
  })),
);
const AdminOrStaffDocumentsPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({
    default: module.AdminOrStaffDocumentsPage,
  })),
);
const AdminOrStaffAppointmentsPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({
    default: module.AdminOrStaffAppointmentsPage,
  })),
);
const AdminOrStaffMessagesPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({
    default: module.AdminOrStaffMessagesPage,
  })),
);
const AdminOrStaffPaymentsPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({
    default: module.AdminOrStaffPaymentsPage,
  })),
);
const ClientPortalDocumentsPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({
    default: module.ClientPortalDocumentsPage,
  })),
);
const ClientPortalAppointmentsPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({
    default: module.ClientPortalAppointmentsPage,
  })),
);
const ClientPortalMessagesPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({
    default: module.ClientPortalMessagesPage,
  })),
);
const ClientPortalPaymentsPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({
    default: module.ClientPortalPaymentsPage,
  })),
);
const MeetingRoomPage = lazy(() =>
  import("@/features/operations/operations-ui").then((module) => ({
    default: module.MeetingRoomPage,
  })),
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
  [APP_ROUTES.dashboardAdminConfigurationVault]: "Configuration Vault",
  [APP_ROUTES.dashboardAdminIntakeEngine]: "Intake Engine",
  [APP_ROUTES.dashboardAdminAcademicEngine]: "Academic Engine",
  [APP_ROUTES.dashboardAdminDigitalVault]: "Digital Vault",
  [APP_ROUTES.dashboardAdminFinancialLedger]: "Financial Ledger",
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
      to={`${APP_ROUTES.auth}?redirect=${encodeURIComponent(APP_ROUTES.dashboard)}`}
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
      to={`${APP_ROUTES.auth}?redirect=${encodeURIComponent(APP_ROUTES.dashboardClient)}`}
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
        to={`${APP_ROUTES.auth}?redirect=${encodeURIComponent(APP_ROUTES.dashboardClients)}`}
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
    <ProtectedRoute area={area}>
      {area === "admin" ? <AdminDashboardLayout /> : <StaffDashboardLayout />}
    </ProtectedRoute>
  );
}

function ProtectedClientLayout() {
  return (
    <ProtectedRoute area="client">
      <ClientDashboardLayout />
    </ProtectedRoute>
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

          <Route
            path={APP_ROUTES.dashboardAdmin}
            element={<ProtectedInternalLayout area="admin" />}
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="profile" element={<DashboardProfilePage />} />
            <Route
              path="leads"
              element={
                <ProtectedRoute area="admin" permissions={["leads.read"]}>
                  <LeadListPage area="admin" />
                </ProtectedRoute>
              }
            />
            <Route
              path="leads/:leadId"
              element={
                <ProtectedRoute area="admin" permissions={["leads.read"]}>
                  <AdminLeadDetailRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="clients"
              element={
                <ProtectedRoute area="admin" permissions={["clients.read"]}>
                  <ClientListPage area="admin" />
                </ProtectedRoute>
              }
            />
            <Route
              path="clients/:clientId"
              element={
                <ProtectedRoute area="admin" permissions={["clients.read"]}>
                  <AdminClientDetailRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="applications"
              element={
                <ProtectedRoute area="admin" permissions={["applications.read"]}>
                  <ApplicationListPage area="admin" />
                </ProtectedRoute>
              }
            />
            <Route
              path="applications/:applicationId"
              element={
                <ProtectedRoute area="admin" permissions={["applications.read"]}>
                  <AdminApplicationDetailRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="tasks"
              element={
                <ProtectedRoute area="admin" permissions={["tasks.read"]}>
                  <TaskListPage area="admin" />
                </ProtectedRoute>
              }
            />
            <Route
              path="documents"
              element={
                <ProtectedRoute area="admin" permissions={["documents.read"]}>
                  <AdminOrStaffDocumentsPage area="admin" />
                </ProtectedRoute>
              }
            />
            <Route
              path="appointments"
              element={
                <ProtectedRoute area="admin" permissions={["appointments.read"]}>
                  <AdminOrStaffAppointmentsPage area="admin" />
                </ProtectedRoute>
              }
            />
            <Route
              path="messages"
              element={
                <ProtectedRoute area="admin" permissions={["messages.read"]}>
                  <AdminOrStaffMessagesPage area="admin" />
                </ProtectedRoute>
              }
            />
            <Route
              path="messages/calls/:meetingId"
              element={
                <ProtectedRoute area="admin" permissions={["messages.read"]}>
                  <MeetingRoomPage mode="internal" area="admin" />
                </ProtectedRoute>
              }
            />
            <Route
              path="payments"
              element={
                <ProtectedRoute area="admin" permissions={["payments.read"]}>
                  <AdminOrStaffPaymentsPage area="admin" />
                </ProtectedRoute>
              }
            />
            <Route
              path="configuration-vault"
              element={
                <ProtectedRoute area="admin" requireAdmin>
                  <DashboardConfigurationVaultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="intake-engine"
              element={
                <ProtectedRoute area="admin" requireAdmin>
                  <DashboardIntakeEnginePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="academic-engine"
              element={
                <ProtectedRoute area="admin" permissions={["applications.read"]}>
                  <DashboardAcademicEnginePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="digital-vault"
              element={
                <ProtectedRoute area="admin" requireAdmin>
                  <DashboardDigitalVaultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="financial-ledger"
              element={
                <ProtectedRoute area="admin" requireAdmin>
                  <DashboardFinancialLedgerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="content"
              element={
                <ProtectedRoute area="admin" permissions={["site_content.read"]}>
                  <DashboardContentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute area="admin" permissions={["users.read"]}>
                  <DashboardUsersPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path={APP_ROUTES.dashboardStaff}
            element={<ProtectedInternalLayout area="staff" />}
          >
            <Route index element={<StaffOverviewPage />} />
            <Route path="profile" element={<DashboardProfilePage />} />
            <Route
              path="leads"
              element={
                <ProtectedRoute area="staff" permissions={["leads.read"]}>
                  <LeadListPage area="staff" />
                </ProtectedRoute>
              }
            />
            <Route
              path="leads/:leadId"
              element={
                <ProtectedRoute area="staff" permissions={["leads.read"]}>
                  <StaffLeadDetailRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="clients"
              element={
                <ProtectedRoute area="staff" permissions={["clients.read"]}>
                  <ClientListPage area="staff" />
                </ProtectedRoute>
              }
            />
            <Route
              path="clients/:clientId"
              element={
                <ProtectedRoute area="staff" permissions={["clients.read"]}>
                  <StaffClientDetailRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="applications"
              element={
                <ProtectedRoute area="staff" permissions={["applications.read"]}>
                  <ApplicationListPage area="staff" />
                </ProtectedRoute>
              }
            />
            <Route
              path="applications/:applicationId"
              element={
                <ProtectedRoute area="staff" permissions={["applications.read"]}>
                  <StaffApplicationDetailRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="tasks"
              element={
                <ProtectedRoute area="staff" permissions={["tasks.read"]}>
                  <TaskListPage area="staff" />
                </ProtectedRoute>
              }
            />
            <Route
              path="documents"
              element={
                <ProtectedRoute area="staff" permissions={["documents.read"]}>
                  <AdminOrStaffDocumentsPage area="staff" />
                </ProtectedRoute>
              }
            />
            <Route
              path="appointments"
              element={
                <ProtectedRoute area="staff" permissions={["appointments.read"]}>
                  <AdminOrStaffAppointmentsPage area="staff" />
                </ProtectedRoute>
              }
            />
            <Route
              path="messages"
              element={
                <ProtectedRoute area="staff" permissions={["messages.read"]}>
                  <AdminOrStaffMessagesPage area="staff" />
                </ProtectedRoute>
              }
            />
            <Route
              path="messages/calls/:meetingId"
              element={
                <ProtectedRoute area="staff" permissions={["messages.read"]}>
                  <MeetingRoomPage mode="internal" area="staff" />
                </ProtectedRoute>
              }
            />
            <Route
              path="payments"
              element={
                <ProtectedRoute area="staff" permissions={["payments.read"]}>
                  <AdminOrStaffPaymentsPage area="staff" />
                </ProtectedRoute>
              }
            />
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
