import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDialogs } from "@/components/ui/app-dialogs";
import { SelectMenu } from "@/components/ui/select-menu";
import { APP_ROUTES } from "@/config/routes";
import { ClientApplicationsTab } from "@/features/applications/applications-ui";
import {
  useClientSessions,
  useCurrentClient,
  useRevokeClientSession,
  useUpdateClientProfile,
} from "@/features/client-auth/use-client-auth";
import type { Client, UpsertClientInput } from "@/features/clients/clients.schemas";
import {
  useClient,
  useClients,
  useDeleteClient,
  useUpsertClient,
} from "@/features/clients/use-clients";
import { useDashboardAccess } from "@/features/dashboard/dashboard-context";
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

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-5xl overflow-y-auto border-slate-200 p-0 sm:max-h-[90vh]">
            <DialogHeader className="border-b border-slate-200 px-6 py-5">
              <DialogTitle className="font-display text-2xl font-extrabold text-slate-950">
                Create Client
              </DialogTitle>
              <DialogDescription>
                Create a new client profile without leaving the list.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-6">
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
            </div>
          </DialogContent>
        </Dialog>
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

        {client ? activeTab === "Overview" ? (
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

      <Dialog open={isEditOpen && Boolean(form)} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-5xl overflow-y-auto border-slate-200 p-0 sm:max-h-[90vh]">
          <DialogHeader className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="font-display text-2xl font-extrabold text-slate-950">
              Edit Client Profile
            </DialogTitle>
            <DialogDescription>
              Update the client profile, assignment, and application status.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-6">
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
                  toast.error(
                    error instanceof Error ? error.message : "Unable to update the client.",
                  );
                }
              }}
              isSubmitting={upsertClientMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ClientSelfProfilePage() {
  const { data: client } = useCurrentClient();
  const sessionsQuery = useClientSessions();
  const revokeSessionMutation = useRevokeClientSession();
  const updateProfileMutation = useUpdateClientProfile();
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
        title="Active Sessions"
        subtitle="Review where your client account is signed in and revoke sessions you do not recognize."
      >
        <div className="space-y-4">
          {sessionsQuery.data?.map((session) => (
            <div
              key={session.id}
              className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={session.isCurrent ? "dark" : "secondary"}>
                    {session.isCurrent ? "Current Session" : "Signed In Elsewhere"}
                  </Badge>
                  <Badge variant={session.rememberMe ? "primary" : "outline"}>
                    {session.rememberMe ? "Keep Me Signed In" : "Browser Session"}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {session.userAgent?.trim() || "Unknown device"}
                </p>
                <p className="text-sm text-slate-600">
                  IP: {session.ipAddress || "Unavailable"} | Last active {formatDateTime(session.lastSeenAt)}
                </p>
                <p className="text-sm text-slate-500">
                  Signed in {formatDateTime(session.createdAt)} | Expires {formatDateTime(session.expiresAt)}
                </p>
              </div>
              <button
                type="button"
                disabled={revokeSessionMutation.isPending}
                onClick={async () => {
                  try {
                    await revokeSessionMutation.mutateAsync(session.id);
                    toast.success(
                      session.isCurrent ? "This session has been signed out." : "Session revoked.",
                    );
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Unable to revoke the session.");
                  }
                }}
                className="btn-gold"
              >
                {session.isCurrent ? "Sign Out This Session" : "Sign Out Other Session"}
              </button>
            </div>
          ))}
          {sessionsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading active sessions...</p>
          ) : null}
          {sessionsQuery.isError ? (
            <p className="text-sm text-rose-600">Unable to load active sessions.</p>
          ) : null}
        </div>
      </Panel>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl overflow-y-auto border-slate-200 p-0 sm:max-h-[90vh]">
          <DialogHeader className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="font-display text-2xl font-extrabold text-slate-950">
              Edit My Profile
            </DialogTitle>
            <DialogDescription>
              Update your personal contact and identity details here.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-6">
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
                  onChange={(passportNumber) =>
                    setForm((current) => ({ ...current, passportNumber }))
                  }
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
          </div>
        </DialogContent>
      </Dialog>
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
        <ReadOnlyField label="Assigned Counselor" value={client.assignedStaffName || "Unassigned"} />
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
      <SelectMenu
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        options={options}
      />
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
