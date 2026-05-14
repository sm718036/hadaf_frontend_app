import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { AppDialog } from "@/components/ui/app-dialog";
import {
  AppTable,
  AppTableBody,
  AppTableCell,
  AppTableHead,
  AppTableHeading,
  AppTableRow,
} from "@/components/ui/app-table";
import { Badge } from "@/components/ui/badge";
import { useAppDialogs } from "@/components/ui/use-app-dialogs";
import { SelectMenu } from "@/components/ui/select-menu";
import { APP_ROUTES } from "@/config/routes";
import { ClientApplicationsTab } from "@/features/applications/applications-ui";
import {
  useChangeClientPassword,
  useClientSessions,
  useCurrentClient,
  useRevokeClientSession,
  useUpdateClientProfile,
} from "@/features/client-auth/use-client-auth";
import { clientAuthService } from "@/features/client-auth/client-auth.service";
import type { Client, UpsertClientInput } from "@/features/clients/clients.schemas";
import {
  useClient,
  useClients,
  useDeleteClient,
  useUpsertClient,
} from "@/features/clients/use-clients";
import { useDashboardAccess } from "@/features/dashboard/use-dashboard-access";
import { DataTable, StatusBadge } from "@/features/dashboard/dashboard-layout";
import {
  EmptyHint,
  LoadingOverlay,
  PaginationControls,
  Panel,
  TableToolbar,
} from "@/features/dashboard/dashboard-ui";
import { useInternalUsers } from "@/features/internal-users/use-users";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { buildPath, useAppNavigate } from "@/lib/router";
import { Skeleton } from "@/components/ui/skeleton";

const CLIENT_STATUS_OPTIONS = ["active", "inactive", "completed", "rejected"] as const;
const APPLICATION_STATUS_OPTIONS = [
  "not_started",
  "in_progress",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "completed",
] as const;

const CLIENT_TABS = [
  "Overview",
  "Applications",
  "Documents",
  "Tasks",
  "Appointments",
  "Payments",
  "Notes",
  "Messages",
] as const;

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function formatDateForInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getClientStatusTone(status: Client["status"]): "neutral" | "warning" | "success" {
  if (status === "completed") return "success";
  if (status === "inactive" || status === "rejected") return "warning";
  return "neutral";
}

function getApplicationStatusTone(
  status: Client["currentApplicationStatus"],
): "neutral" | "warning" | "info" | "success" {
  if (status === "approved" || status === "completed") return "success";
  if (status === "submitted" || status === "under_review") return "info";
  if (status === "rejected") return "warning";
  return "neutral";
}

function createEmptyClientForm(): UpsertClientInput {
  return {
    fullName: "",
    email: "",
    phone: "",
    cnic: "",
    passportNumber: "",
    dateOfBirth: "",
    address: "",
    countryOfResidence: "",
    targetCountry: "",
    targetService: "",
    educationLevel: "",
    lastQualification: "",
    assignedStaffUserId: null,
    status: "active",
    currentApplicationStatus: "not_started",
    emergencyContact: "",
    internalNotes: "",
  };
}

function mapClientToForm(client: Client): UpsertClientInput {
  return {
    id: client.id,
    fullName: client.fullName,
    email: client.email ?? "",
    phone: client.phone ?? "",
    cnic: client.cnic ?? "",
    passportNumber: client.passportNumber ?? "",
    dateOfBirth: formatDateForInput(client.dateOfBirth),
    address: client.address ?? "",
    countryOfResidence: client.countryOfResidence ?? "",
    targetCountry: client.targetCountry ?? "",
    targetService: client.targetService ?? "",
    educationLevel: client.educationLevel ?? "",
    lastQualification: client.lastQualification ?? "",
    assignedStaffUserId: client.assignedStaffUserId,
    status: client.status,
    currentApplicationStatus: client.currentApplicationStatus,
    emergencyContact: client.emergencyContact ?? "",
    internalNotes: client.internalNotes ?? "",
  };
}

export function ClientListPage({ area }: { area: "admin" | "staff" }) {
  const dialogs = useAppDialogs();
  const navigate = useAppNavigate();
  const access = useDashboardAccess();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [status, setStatus] = useState("");
  const [country, setCountry] = useState("");
  const [targetCountry, setTargetCountry] = useState("");
  const [targetService, setTargetService] = useState("");
  const [staffId, setStaffId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<UpsertClientInput>(createEmptyClientForm());
  const clientsQuery = useClients({
    enabled: access.canReadClients,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search: deferredSearch,
    status,
    country,
    targetCountry,
    targetService,
    staffId,
  });
  const upsertClientMutation = useUpsertClient();
  const deleteClientMutation = useDeleteClient();
  const staffUsersQuery = useInternalUsers({
    enabled: area === "admin",
    page: 1,
    pageSize: 100,
    search: "",
  });

  const staffUsers = useMemo(
    () => (staffUsersQuery.data?.items ?? []).filter((user) => user.role === "staff"),
    [staffUsersQuery.data],
  );

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, status, country, targetCountry, targetService, staffId]);

  const detailRoute =
    area === "admin" ? "/dashboard/admin/clients/:clientId" : "/dashboard/staff/clients/:clientId";

  return (
    <div className="space-y-6">
      <Panel
        title={area === "admin" ? "Client Profiles" : "Assigned Clients"}
        subtitle={
          area === "admin"
            ? "Manage client profiles, counselor assignment, application status, and internal notes."
            : "View and update only the client profiles assigned to your account."
        }
        action={
          area === "admin" ? (
            <button
              type="button"
              className="btn-gold"
              onClick={() => {
                setForm(createEmptyClientForm());
                setIsCreateOpen(true);
              }}
            >
              Create Client
            </button>
          ) : undefined
        }
      >
        <TableToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search by name, email, phone, CNIC, or passport..."
          summary={`${clientsQuery.data?.total ?? 0} matching client records`}
        />

        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <SelectMenu
            value={status}
            onValueChange={setStatus}
            className="h-auto bg-slate-50 py-3"
            options={[
              { value: "", label: "All statuses" },
              ...CLIENT_STATUS_OPTIONS.map((option) => ({ value: option, label: option })),
            ]}
          />
          <input
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="Country of residence"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          />
          <input
            value={targetCountry}
            onChange={(event) => setTargetCountry(event.target.value)}
            placeholder="Target country"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          />
          <input
            value={targetService}
            onChange={(event) => setTargetService(event.target.value)}
            placeholder="Target service"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          />
          {area === "admin" ? (
            <SelectMenu
              value={staffId}
              onValueChange={setStaffId}
              className="h-auto bg-slate-50 py-3"
              options={[
                { value: "", label: "All counselors" },
                ...staffUsers.map((user) => ({ value: user.id, label: user.name })),
              ]}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Assigned to you
            </div>
          )}
        </div>

        {clientsQuery.isLoading ? (
          <EmptyHint message="Loading client profiles..." loading />
        ) : clientsQuery.isError ? (
          <EmptyHint message="Unable to load client profiles." tone="error" />
        ) : (
          <>
            <DataTable
              columns={[
                "Client",
                "Residence",
                "Target",
                "Counselor",
                "Client Status",
                "Application",
                "Action",
              ]}
              rows={(clientsQuery.data?.items ?? []).map((client) => [
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{client.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {client.email || client.phone || "No contact info"}
                  </p>
                </div>,
                client.countryOfResidence || "—",
                [client.targetCountry, client.targetService].filter(Boolean).join(" · ") || "—",
                client.assignedStaffName || "Unassigned",
                <StatusBadge tone={getClientStatusTone(client.status)}>
                  {client.status}
                </StatusBadge>,
                <StatusBadge tone={getApplicationStatusTone(client.currentApplicationStatus)}>
                  {client.currentApplicationStatus.replace("_", " ")}
                </StatusBadge>,
                <div className="flex items-center justify-center gap-2">
                  <Link
                    to={buildPath(detailRoute, { params: { clientId: client.id } })}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View
                  </Link>
                  {area === "admin" ? (
                    <button
                      type="button"
                      className="rounded-xl border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive"
                      onClick={async () => {
                        const confirmed = await dialogs.confirm({
                          title: "Delete client?",
                          description: `Delete client ${client.fullName}. This action cannot be undone.`,
                          confirmLabel: "Delete",
                          tone: "destructive",
                        });

                        if (!confirmed) {
                          return;
                        }

                        try {
                          await deleteClientMutation.mutateAsync(client.id);
                          toast.success("Client deleted.");
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Unable to delete the client.",
                          );
                        }
                      }}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>,
              ])}
              emptyMessage={
                deferredSearch ? "No matching clients found." : "No client profiles found yet."
              }
            />
            <PaginationControls
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              total={clientsQuery.data?.total ?? 0}
              totalPages={clientsQuery.data?.totalPages ?? 1}
              onPageChange={setPage}
            />
          </>
        )}

        <AppDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          title="Create Client"
          description="Create a new client profile without leaving the list."
          contentClassName="max-w-5xl overflow-y-auto sm:max-h-[90vh]"
        >
          <ClientProfileForm
            form={form}
            onChange={setForm}
            staffUsers={staffUsers.map((user) => ({ id: user.id, name: user.name }))}
            canAssign
            showInternalFields
            onSubmit={async () => {
              try {
                const client = await upsertClientMutation.mutateAsync(form);
                toast.success("Client created.");
                setIsCreateOpen(false);
                navigate(detailRoute, { params: { clientId: client.id } });
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Unable to create the client.",
                );
              }
            }}
            isSubmitting={upsertClientMutation.isPending}
          />
        </AppDialog>
      </Panel>
    </div>
  );
}

export function ClientDetailPage({
  area,
  clientId,
}: {
  area: "admin" | "staff";
  clientId: string;
}) {
  const dialogs = useAppDialogs();
  const navigate = useAppNavigate();
  const clientQuery = useClient(clientId, true);
  const upsertClientMutation = useUpsertClient();
  const deleteClientMutation = useDeleteClient();
  const staffUsersQuery = useInternalUsers({
    enabled: area === "admin",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const [activeTab, setActiveTab] = useState<(typeof CLIENT_TABS)[number]>("Overview");
  const [form, setForm] = useState<UpsertClientInput | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (clientQuery.data?.client) {
      setForm(mapClientToForm(clientQuery.data.client));
    }
  }, [clientQuery.data]);

  const staffUsers = useMemo(
    () => (staffUsersQuery.data?.items ?? []).filter((user) => user.role === "staff"),
    [staffUsersQuery.data],
  );

  const baseRoute =
    area === "admin" ? APP_ROUTES.dashboardAdminClients : APP_ROUTES.dashboardStaffClients;

  if (clientQuery.isError || !clientQuery.data) {
    return <EmptyHint message="Unable to load the client profile." tone="error" />;
  }

  const client = clientQuery.data?.client;
  const isBlockingLoad = !client || !form;
  const isOverlayVisible = clientQuery.isFetching || isBlockingLoad;

  return (
    <div className="space-y-6">
      <Panel
        className="relative overflow-hidden"
        title={client?.fullName ?? "Client Profile"}
        subtitle="Manage the client profile, counselor assignment, and current application state."
        action={
          <div className="flex flex-wrap gap-3">
            <Badge variant="dark">{client.currentApplicationStatus.replace("_", " ")}</Badge>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => navigate(baseRoute)}
            >
              Back to Clients
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => {
                if (client) {
                  setForm(mapClientToForm(client));
                }
                setIsEditOpen(true);
              }}
            >
              Edit Profile
            </button>
            {area === "admin" && client ? (
              <button
                type="button"
                className="rounded-xl border border-destructive/20 px-4 py-2 text-sm font-semibold text-destructive"
                onClick={async () => {
                  const confirmed = await dialogs.confirm({
                    title: "Delete client?",
                    description: `Delete client ${client.fullName}. This action cannot be undone.`,
                    confirmLabel: "Delete",
                    tone: "destructive",
                  });

                  if (!confirmed) {
                    return;
                  }

                  try {
                    await deleteClientMutation.mutateAsync(client.id);
                    toast.success("Client deleted.");
                    navigate(baseRoute);
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Unable to delete the client.",
                    );
                  }
                }}
              >
                Delete
              </button>
            ) : null}
          </div>
        }
      >
        <div className="mb-6 flex flex-wrap gap-2">
          {CLIENT_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab ? "bg-gold text-dark" : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {client ? (
          activeTab === "Overview" ? (
            <ClientProfileOverview client={client} />
          ) : activeTab === "Applications" ? (
            <ClientApplicationsTab area={area} clientId={client.id} />
          ) : activeTab === "Notes" ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
              {client.internalNotes || "No internal notes added yet."}
            </div>
          ) : (
            <EmptyHint
              message={`${activeTab} is structured for this client profile and can be connected to its dedicated module data when those resources are implemented.`}
            />
          )
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <Skeleton className="h-3 w-28 rounded-full bg-slate-200" />
                <Skeleton className="mt-4 h-6 w-3/4 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        )}
        {isOverlayVisible ? <LoadingOverlay label="Loading client profile..." /> : null}
      </Panel>

      <AppDialog
        open={isEditOpen && Boolean(form)}
        onOpenChange={setIsEditOpen}
        title="Edit Client Profile"
        description="Update the client profile, assignment, and application status."
        contentClassName="max-w-5xl overflow-y-auto sm:max-h-[90vh]"
      >
        <ClientProfileForm
          form={form ?? createEmptyClientForm()}
          onChange={setForm}
          staffUsers={staffUsers.map((user) => ({ id: user.id, name: user.name }))}
          canAssign={area === "admin"}
          showInternalFields
          onSubmit={async () => {
            if (!form) return;
            try {
              await upsertClientMutation.mutateAsync(form);
              toast.success("Client profile updated.");
              setIsEditOpen(false);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to update the client.");
            }
          }}
          isSubmitting={upsertClientMutation.isPending}
        />
      </AppDialog>
    </div>
  );
}

export function ClientSelfProfilePage() {
  const { data: client } = useCurrentClient();
  const sessionsQuery = useClientSessions();
  const revokeSessionMutation = useRevokeClientSession();
  const updateProfileMutation = useUpdateClientProfile();
  const changePasswordMutation = useChangeClientPassword();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    cnic: "",
    passportNumber: "",
    dateOfBirth: "",
    address: "",
    countryOfResidence: "",
    emergencyContact: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isResetEmailPending, setIsResetEmailPending] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        fullName: client.name,
        email: client.email,
        phone: client.phone ?? "",
        cnic: client.cnic ?? "",
        passportNumber: client.passportNumber ?? "",
        dateOfBirth: formatDateForInput(client.dateOfBirth),
        address: client.address ?? "",
        countryOfResidence: client.countryOfResidence ?? "",
        emergencyContact: client.emergencyContact ?? "",
      });
    }
  }, [client]);

  if (!client) {
    return null;
  }

  const selectedSession =
    sessionsQuery.data?.find((session) => session.id === selectedSessionId) ?? null;

  return (
    <div className="space-y-6">
      <Panel
        title="My Profile"
        subtitle="You can update your personal information here. Program-specific assignment and internal notes remain managed by Hadaf staff."
        action={
          <button type="button" className="btn-gold" onClick={() => setIsEditOpen(true)}>
            Edit Profile
          </button>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ReadOnlyField label="Full Name" value={form.fullName} />
            <ReadOnlyField label="Email" value={form.email || "—"} />
            <ReadOnlyField label="Phone" value={form.phone || "—"} />
            <ReadOnlyField label="CNIC / National ID" value={form.cnic || "—"} />
            <ReadOnlyField label="Passport Number" value={form.passportNumber || "—"} />
            <ReadOnlyField label="Date of Birth" value={form.dateOfBirth || "—"} />
            <ReadOnlyField label="Country of Residence" value={form.countryOfResidence || "—"} />
            <ReadOnlyField label="Emergency Contact" value={form.emergencyContact || "—"} />
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
            {form.address || "No address added yet."}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ReadOnlyField label="Target Country" value={client.targetCountry || "Not assigned"} />
            <ReadOnlyField label="Target Service" value={client.targetService || "Not assigned"} />
            <ReadOnlyField
              label="Application Status"
              value={client.currentApplicationStatus.replace("_", " ")}
            />
          </div>
        </div>
      </Panel>

      <Panel
        title="Password"
        subtitle="Change your password using your current password. All active sessions will be signed out after the change."
      >
        <button type="button" className="btn-gold" onClick={() => setIsPasswordDialogOpen(true)}>
          Change Password
        </button>
      </Panel>

      <Panel
        title="Active Sessions"
        subtitle="Review where your client account is signed in and revoke sessions you do not recognize."
      >
        <AppTable minWidthClass="min-w-[760px]">
          <AppTableHead>
            <AppTableRow>
              {["Session", "Type", "Browser", "IP", "Actions"].map((heading) => (
                <AppTableHeading key={heading} align="left">
                  {heading}
                </AppTableHeading>
              ))}
            </AppTableRow>
          </AppTableHead>
          <AppTableBody>
            {sessionsQuery.data?.map((session) => (
              <AppTableRow key={session.id}>
                <AppTableCell align="left">
                  <Badge variant={session.isCurrent ? "dark" : "secondary"}>
                    {session.isCurrent ? "Current" : "Other"}
                  </Badge>
                </AppTableCell>
                <AppTableCell align="left">
                  <Badge variant={session.rememberMe ? "primary" : "outline"}>
                    {session.rememberMe ? "Persistent" : "Browser"}
                  </Badge>
                </AppTableCell>
                <AppTableCell align="left" className="font-medium text-slate-900">
                  {summarizeClientUserAgent(session.userAgent)}
                </AppTableCell>
                <AppTableCell align="left" className="text-slate-600">
                  {session.ipAddress || "Unavailable"}
                </AppTableCell>
                <AppTableCell align="left">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSessionId(session.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <Info className="h-4 w-4" />
                      Details
                    </button>
                    <button
                      type="button"
                      disabled={revokeSessionMutation.isPending}
                      onClick={async () => {
                        try {
                          await revokeSessionMutation.mutateAsync(session.id);
                          toast.success(
                            session.isCurrent
                              ? "This session has been signed out."
                              : "Session revoked.",
                          );
                        } catch (error) {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "Unable to revoke the session.",
                          );
                        }
                      }}
                      className="btn-gold"
                    >
                      {session.isCurrent ? "Logout" : "Revoke"}
                    </button>
                  </div>
                </AppTableCell>
              </AppTableRow>
            ))}
          </AppTableBody>
        </AppTable>
        {sessionsQuery.isLoading ? (
          <p className="mt-5 px-5 text-sm text-slate-500">Loading active sessions...</p>
        ) : null}
        {sessionsQuery.isError ? (
          <p className="mt-5 px-5 text-sm text-rose-600">Unable to load active sessions.</p>
        ) : null}
      </Panel>
      <AppDialog
        open={Boolean(selectedSession)}
        onOpenChange={(open) => !open && setSelectedSessionId(null)}
        title="Session Details"
        description="Review more information about this signed-in session."
        contentClassName="max-h-[90vh] w-[calc(100%-2rem)] max-w-xl overflow-hidden"
        bodyClassName="max-h-[calc(90vh-104px)] overflow-y-auto"
      >
        {selectedSession ? (
          <div className="space-y-4">
            <SessionDetailRow
              label="Browser / Device"
              value={selectedSession.userAgent?.trim() || "Unknown device"}
            />
            <SessionDetailRow
              label="IP Address"
              value={selectedSession.ipAddress || "Unavailable"}
            />
            <SessionDetailRow
              label="Last Active"
              value={formatDateTime(selectedSession.lastSeenAt)}
            />
            <SessionDetailRow label="Signed In" value={formatDateTime(selectedSession.createdAt)} />
            <SessionDetailRow label="Expires" value={formatDateTime(selectedSession.expiresAt)} />
            <SessionDetailRow
              label="Session Type"
              value={selectedSession.rememberMe ? "Keep Me Signed In" : "Browser Session"}
            />
          </div>
        ) : null}
      </AppDialog>
      <AppDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        title="Change Password"
        description="Confirm your current password and choose a new one. All active sessions will be signed out after the change."
        contentClassName="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden"
        bodyClassName="max-h-[calc(90vh-104px)] overflow-y-auto !px-0 !py-0"
      >
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-600">
              Don&apos;t remember your current password? Send a reset link to{" "}
              <span className="font-semibold text-slate-900">{client.email}</span>.
            </p>
            <button
              type="button"
              disabled={isResetEmailPending}
              onClick={async () => {
                try {
                  setIsResetEmailPending(true);
                  const result = await clientAuthService.requestPasswordReset({
                    email: client.email,
                  });
                  toast.success(result.message);
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Unable to send password reset email.",
                  );
                } finally {
                  setIsResetEmailPending(false);
                }
              }}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResetEmailPending ? "Sending..." : "Send Reset Email"}
            </button>
          </div>
        </div>
        <form
          className="grid gap-4 px-6 py-6 md:grid-cols-3"
          onSubmit={async (event) => {
            event.preventDefault();

            try {
              const result = await changePasswordMutation.mutateAsync(passwordForm);
              toast.success(result.message);
              setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              setIsPasswordDialogOpen(false);
              window.location.assign(buildPath(APP_ROUTES.auth, { search: { mode: "client" } }));
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to change password.");
            }
          }}
        >
          <TextField
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(currentPassword) =>
              setPasswordForm((current) => ({ ...current, currentPassword }))
            }
          />
          <TextField
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(newPassword) => setPasswordForm((current) => ({ ...current, newPassword }))}
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(confirmPassword) =>
              setPasswordForm((current) => ({ ...current, confirmPassword }))
            }
          />
          <div className="md:col-span-3">
            <button type="submit" disabled={changePasswordMutation.isPending} className="btn-gold">
              {changePasswordMutation.isPending ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </AppDialog>

      <AppDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit My Profile"
        description="Update your personal contact and identity details here."
        contentClassName="max-w-4xl overflow-y-auto sm:max-h-[90vh]"
      >
        <form
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();

            try {
              await updateProfileMutation.mutateAsync(form);
              toast.success("Profile updated.");
              setIsEditOpen(false);
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Unable to update your profile.",
              );
            }
          }}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <TextField
              label="Full Name"
              value={form.fullName}
              onChange={(fullName) => setForm((current) => ({ ...current, fullName }))}
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(email) => setForm((current) => ({ ...current, email }))}
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(phone) => setForm((current) => ({ ...current, phone }))}
            />
            <TextField
              label="CNIC / National ID"
              value={form.cnic}
              onChange={(cnic) => setForm((current) => ({ ...current, cnic }))}
            />
            <TextField
              label="Passport Number"
              value={form.passportNumber}
              onChange={(passportNumber) => setForm((current) => ({ ...current, passportNumber }))}
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(dateOfBirth) => setForm((current) => ({ ...current, dateOfBirth }))}
            />
            <TextField
              label="Country of Residence"
              value={form.countryOfResidence}
              onChange={(countryOfResidence) =>
                setForm((current) => ({ ...current, countryOfResidence }))
              }
            />
            <TextField
              label="Emergency Contact"
              value={form.emergencyContact}
              onChange={(emergencyContact) =>
                setForm((current) => ({ ...current, emergencyContact }))
              }
            />
          </div>
          <TextAreaField
            label="Address"
            value={form.address}
            onChange={(address) => setForm((current) => ({ ...current, address }))}
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-gold min-w-[180px] justify-center"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Update Profile"}
            </button>
          </div>
        </form>
      </AppDialog>
    </div>
  );
}

function ClientProfileOverview({ client }: { client: Client }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ReadOnlyField label="Full Name" value={client.fullName} />
        <ReadOnlyField label="Email" value={client.email || "—"} />
        <ReadOnlyField label="Phone" value={client.phone || "—"} />
        <ReadOnlyField label="CNIC / National ID" value={client.cnic || "—"} />
        <ReadOnlyField label="Passport Number" value={client.passportNumber || "—"} />
        <ReadOnlyField label="Date of Birth" value={formatDate(client.dateOfBirth)} />
        <ReadOnlyField label="Country of Residence" value={client.countryOfResidence || "—"} />
        <ReadOnlyField label="Target Country" value={client.targetCountry || "—"} />
        <ReadOnlyField label="Target Service" value={client.targetService || "—"} />
        <ReadOnlyField label="Education Level" value={client.educationLevel || "—"} />
        <ReadOnlyField label="Last Qualification" value={client.lastQualification || "—"} />
        <ReadOnlyField label="Emergency Contact" value={client.emergencyContact || "—"} />
        <ReadOnlyField
          label="Assigned Counselor"
          value={client.assignedStaffName || "Unassigned"}
        />
        <ReadOnlyField label="Client Status" value={client.status} />
        <ReadOnlyField
          label="Application Status"
          value={client.currentApplicationStatus.replace("_", " ")}
        />
      </div>
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
        {client.address || "No address added yet."}
      </div>
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
        {client.internalNotes || "No internal notes added yet."}
      </div>
    </div>
  );
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function summarizeClientUserAgent(userAgent: string | null) {
  const value = userAgent?.trim();

  if (!value) {
    return "Unknown device";
  }

  const browser = /Edg\//.test(value)
    ? "Edge"
    : /Chrome\//.test(value)
      ? "Chrome"
      : /Firefox\//.test(value)
        ? "Firefox"
        : /Safari\//.test(value) && !/Chrome\//.test(value)
          ? "Safari"
          : /MSIE|Trident/.test(value)
            ? "Internet Explorer"
            : "Browser";

  const platform = /Android/.test(value)
    ? "Android"
    : /iPhone|iPad|iPod/.test(value)
      ? "iOS"
      : /Windows/.test(value)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(value)
          ? "macOS"
          : /Linux/.test(value)
            ? "Linux"
            : "Unknown";

  return `${browser} on ${platform}`;
}

function ClientProfileForm({
  form,
  onChange,
  staffUsers,
  canAssign,
  showInternalFields,
  onSubmit,
  isSubmitting,
}: {
  form: UpsertClientInput;
  onChange: (value: UpsertClientInput) => void;
  staffUsers: Array<{ id: string; name: string }>;
  canAssign: boolean;
  showInternalFields: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <TextField
          label="Full Name"
          value={form.fullName}
          onChange={(fullName) => onChange({ ...form, fullName })}
        />
        <TextField
          label="Email"
          value={form.email}
          onChange={(email) => onChange({ ...form, email })}
        />
        <TextField
          label="Phone"
          value={form.phone}
          onChange={(phone) => onChange({ ...form, phone })}
        />
        <TextField
          label="CNIC / National ID"
          value={form.cnic}
          onChange={(cnic) => onChange({ ...form, cnic })}
        />
        <TextField
          label="Passport Number"
          value={form.passportNumber}
          onChange={(passportNumber) => onChange({ ...form, passportNumber })}
        />
        <TextField
          label="Date of Birth"
          type="date"
          value={form.dateOfBirth}
          onChange={(dateOfBirth) => onChange({ ...form, dateOfBirth })}
        />
        <TextField
          label="Country of Residence"
          value={form.countryOfResidence}
          onChange={(countryOfResidence) => onChange({ ...form, countryOfResidence })}
        />
        <TextField
          label="Target Country"
          value={form.targetCountry}
          onChange={(targetCountry) => onChange({ ...form, targetCountry })}
        />
        <TextField
          label="Target Service"
          value={form.targetService}
          onChange={(targetService) => onChange({ ...form, targetService })}
        />
        <TextField
          label="Education Level"
          value={form.educationLevel}
          onChange={(educationLevel) => onChange({ ...form, educationLevel })}
        />
        <TextField
          label="Last Qualification"
          value={form.lastQualification}
          onChange={(lastQualification) => onChange({ ...form, lastQualification })}
        />
        <TextField
          label="Emergency Contact"
          value={form.emergencyContact}
          onChange={(emergencyContact) => onChange({ ...form, emergencyContact })}
        />
        <SelectField
          label="Client Status"
          value={form.status}
          onChange={(status) => onChange({ ...form, status: status as Client["status"] })}
          options={CLIENT_STATUS_OPTIONS.map((option) => ({ value: option, label: option }))}
        />
        <SelectField
          label="Application Status"
          value={form.currentApplicationStatus}
          onChange={(currentApplicationStatus) =>
            onChange({
              ...form,
              currentApplicationStatus:
                currentApplicationStatus as Client["currentApplicationStatus"],
            })
          }
          options={APPLICATION_STATUS_OPTIONS.map((option) => ({
            value: option,
            label: option.replace("_", " "),
          }))}
        />
        <SelectField
          label="Assigned Counselor"
          value={form.assignedStaffUserId ?? ""}
          disabled={!canAssign}
          onChange={(assignedStaffUserId) =>
            onChange({ ...form, assignedStaffUserId: assignedStaffUserId || null })
          }
          options={[
            { value: "", label: "Unassigned" },
            ...staffUsers.map((user) => ({ value: user.id, label: user.name })),
          ]}
        />
      </div>

      <TextAreaField
        label="Address"
        value={form.address}
        onChange={(address) => onChange({ ...form, address })}
      />
      {showInternalFields ? (
        <TextAreaField
          label="Internal Admin / Staff Notes"
          value={form.internalNotes}
          onChange={(internalNotes) => onChange({ ...form, internalNotes })}
        />
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-gold min-w-[180px] justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Client"}
        </button>
      </div>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date";
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <textarea
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-300"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <SelectMenu value={value} disabled={disabled} onValueChange={onChange} options={options} />
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function SessionDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </div>
        <div className="break-words text-sm font-semibold text-slate-900 sm:max-w-[65%] sm:text-right">
          {value}
        </div>
      </div>
    </div>
  );
}
