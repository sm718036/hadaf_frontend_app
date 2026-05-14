import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AppDialog } from "@/components/ui/app-dialog";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useAppDialogs } from "@/components/ui/use-app-dialogs";
import { SelectMenu } from "@/components/ui/select-menu";
import { APP_ROUTES } from "@/config/routes";
import type {
  Application,
  ApplicationDetail,
  ApplicationStageHistory,
  UpsertApplicationInput,
} from "@/features/applications/applications.schemas";
import { APPLICATION_STAGES } from "@/features/applications/applications.schemas";
import {
  useApplication,
  useApplications,
  useDeleteApplication,
  useMoveApplicationStage,
  useOwnApplications,
  useUpsertApplication,
} from "@/features/applications/use-applications";
import { useClients } from "@/features/clients/use-clients";
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

const APPLICATION_STATUS_OPTIONS = [
  "active",
  "paused",
  "approved",
  "rejected",
  "completed",
] as const;
const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"] as const;

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatDateForInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getStatusTone(status: Application["status"]): "neutral" | "warning" | "info" | "success" {
  if (status === "approved" || status === "completed") return "success";
  if (status === "paused" || status === "rejected") return "warning";
  return "info";
}

function getPriorityTone(
  priority: Application["priority"],
): "neutral" | "warning" | "info" | "success" {
  if (priority === "urgent") return "warning";
  if (priority === "high") return "info";
  if (priority === "low") return "success";
  return "neutral";
}

function createEmptyApplicationForm(
  clientId = "",
  assignedStaffUserId: string | null = null,
): UpsertApplicationInput {
  return {
    clientId,
    targetCountry: "",
    serviceType: "",
    universityProgram: "",
    assignedStaffUserId,
    currentStage: APPLICATION_STAGES[0],
    status: "active",
    priority: "medium",
    deadline: "",
    notes: "",
    historyNote: "",
  };
}

function mapApplicationToForm(application: Application): UpsertApplicationInput {
  return {
    id: application.id,
    clientId: application.clientId,
    targetCountry: application.targetCountry,
    serviceType: application.serviceType,
    universityProgram: application.universityProgram ?? "",
    assignedStaffUserId: application.assignedStaffUserId,
    currentStage: application.currentStage,
    status: application.status,
    priority: application.priority,
    deadline: formatDateForInput(application.deadline),
    notes: application.notes ?? "",
    historyNote: "",
  };
}

export function ApplicationListPage({
  area,
  clientId = "",
}: {
  area: "admin" | "staff";
  clientId?: string;
}) {
  const dialogs = useAppDialogs();
  const navigate = useAppNavigate();
  const access = useDashboardAccess();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [country, setCountry] = useState("");
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");
  const [staffId, setStaffId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<UpsertApplicationInput>(
    createEmptyApplicationForm(clientId, area === "staff" ? access.currentUser.id : null),
  );

  const applicationsQuery = useApplications({
    enabled: access.canReadApplications,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search: deferredSearch,
    country,
    stage,
    status,
    staffId,
    clientId,
    dateFrom,
    dateTo,
  });
  const upsertApplicationMutation = useUpsertApplication();
  const deleteApplicationMutation = useDeleteApplication();
  const staffUsersQuery = useInternalUsers({
    enabled: area === "admin",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const clientsQuery = useClients({
    enabled: access.canReadClients && isCreateOpen,
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
  }, [deferredSearch, country, stage, status, staffId, dateFrom, dateTo, clientId]);

  const detailRoute =
    area === "admin"
      ? "/dashboard/admin/applications/:applicationId"
      : "/dashboard/staff/applications/:applicationId";

  return (
    <div className="space-y-6">
      <Panel
        title={
          clientId
            ? "Client Applications"
            : area === "admin"
              ? "Application Pipeline"
              : "Assigned Applications"
        }
        subtitle={
          clientId
            ? "Applications linked to this client profile."
            : area === "admin"
              ? "Manage study and visa applications across the full pipeline."
              : "Work only with applications assigned to your account."
        }
        action={
          <button
            type="button"
            className="btn-gold"
            onClick={() => {
              setForm(
                createEmptyApplicationForm(
                  clientId,
                  area === "staff" ? access.currentUser.id : null,
                ),
              );
              setIsCreateOpen(true);
            }}
          >
            Create Application
          </button>
        }
      >
        <TableToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search by client name, email, phone, or program..."
          summary={`${applicationsQuery.data?.total ?? 0} matching application records`}
        />

        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="Target country"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          />
          <SelectMenu
            value={stage}
            onValueChange={setStage}
            className="h-auto bg-slate-50 py-3"
            options={[
              { value: "", label: "All stages" },
              ...APPLICATION_STAGES.map((option) => ({ value: option, label: option })),
            ]}
          />
          <SelectMenu
            value={status}
            onValueChange={setStatus}
            className="h-auto bg-slate-50 py-3"
            options={[
              { value: "", label: "All statuses" },
              ...APPLICATION_STATUS_OPTIONS.map((option) => ({ value: option, label: option })),
            ]}
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
          <DateRangePicker
            value={{ startDate: dateFrom, endDate: dateTo }}
            onChange={({ startDate, endDate }) => {
              setDateFrom(startDate);
              setDateTo(endDate);
            }}
            placeholder="Created date range"
            opens="left"
            className="md:col-span-2 xl:col-span-2"
          />
        </div>

        {applicationsQuery.isLoading ? (
          <EmptyHint message="Loading applications..." loading />
        ) : applicationsQuery.isError ? (
          <EmptyHint message="Unable to load applications." tone="error" />
        ) : (
          <>
            <DataTable
              columns={[
                "Application",
                "Client",
                "Counselor",
                "Stage",
                "Status",
                "Progress",
                "Deadline",
                "Action",
              ]}
              rows={(applicationsQuery.data?.items ?? []).map((application) => [
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{application.targetCountry}</p>
                  <p className="text-xs text-slate-500">{application.serviceType}</p>
                </div>,
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{application.clientName}</p>
                  <p className="text-xs text-slate-500">
                    {application.clientEmail || application.clientPhone || "No contact info"}
                  </p>
                </div>,
                application.assignedStaffName || "Unassigned",
                <div className="max-w-[220px] text-left text-xs font-medium text-slate-700">
                  {application.currentStage}
                </div>,
                <div className="flex flex-col items-center gap-2">
                  <StatusBadge tone={getStatusTone(application.status)}>
                    {application.status}
                  </StatusBadge>
                  <StatusBadge tone={getPriorityTone(application.priority)}>
                    {application.priority}
                  </StatusBadge>
                </div>,
                <div className="min-w-[120px]">
                  <div className="text-sm font-semibold text-slate-900">
                    {application.progressPercent}%
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gold"
                      style={{ width: `${application.progressPercent}%` }}
                    />
                  </div>
                </div>,
                <div className="text-center">
                  <div>{formatDate(application.deadline)}</div>
                  {application.isOverdue ? (
                    <div className="mt-1 text-xs font-semibold text-destructive">Overdue</div>
                  ) : null}
                </div>,
                <div className="flex items-center justify-center gap-2">
                  <Link
                    to={buildPath(detailRoute, { params: { applicationId: application.id } })}
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
                          title: "Delete application?",
                          description: `Delete the application for ${application.clientName}. This action cannot be undone.`,
                          confirmLabel: "Delete",
                          tone: "destructive",
                        });

                        if (!confirmed) {
                          return;
                        }

                        try {
                          await deleteApplicationMutation.mutateAsync(application.id);
                          toast.success("Application deleted.");
                        } catch (error) {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "Unable to delete the application.",
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
                deferredSearch ? "No matching applications found." : "No applications found yet."
              }
            />
            <PaginationControls
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              total={applicationsQuery.data?.total ?? 0}
              totalPages={applicationsQuery.data?.totalPages ?? 1}
              onPageChange={setPage}
            />
          </>
        )}

        <AppDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          title="Create Application"
          description="Add a new application record without leaving the pipeline view."
          contentClassName="max-w-5xl overflow-y-auto sm:max-h-[90vh]"
        >
          <ApplicationForm
            form={form}
            onChange={setForm}
            clients={(clientsQuery.data?.items ?? []).map((client) => ({
              id: client.id,
              name: client.fullName,
            }))}
            staffUsers={staffUsers.map((user) => ({ id: user.id, name: user.name }))}
            area={area}
            onSubmit={async () => {
              try {
                const application = await upsertApplicationMutation.mutateAsync(form);
                toast.success("Application created.");
                setIsCreateOpen(false);
                navigate(detailRoute, { params: { applicationId: application.id } });
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "Unable to create the application.",
                );
              }
            }}
            isSubmitting={upsertApplicationMutation.isPending}
            lockClient={Boolean(clientId)}
          />
        </AppDialog>
      </Panel>
    </div>
  );
}

export function ApplicationDetailPage({
  area,
  applicationId,
}: {
  area: "admin" | "staff";
  applicationId: string;
}) {
  const dialogs = useAppDialogs();
  const navigate = useAppNavigate();
  const access = useDashboardAccess();
  const applicationQuery = useApplication(applicationId, access.canReadApplications);
  const upsertApplicationMutation = useUpsertApplication();
  const moveStageMutation = useMoveApplicationStage();
  const deleteApplicationMutation = useDeleteApplication();
  const staffUsersQuery = useInternalUsers({
    enabled: area === "admin",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const clientsQuery = useClients({
    enabled: access.canReadClients,
    page: 1,
    pageSize: 100,
    search: "",
  });
  const [form, setForm] = useState<UpsertApplicationInput | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (applicationQuery.data?.application) {
      setForm(mapApplicationToForm(applicationQuery.data.application));
    }
  }, [applicationQuery.data]);

  const staffUsers = useMemo(
    () => (staffUsersQuery.data?.items ?? []).filter((user) => user.role === "staff"),
    [staffUsersQuery.data],
  );

  const baseRoute =
    area === "admin"
      ? APP_ROUTES.dashboardAdminApplications
      : APP_ROUTES.dashboardStaffApplications;

  if (applicationQuery.isError || !applicationQuery.data) {
    return <EmptyHint message="Unable to load the application." tone="error" />;
  }

  const application = applicationQuery.data?.application;
  const history = applicationQuery.data?.history ?? [];
  const isBlockingLoad = !application || !form;
  const isOverlayVisible = applicationQuery.isFetching || isBlockingLoad;

  return (
    <div className="space-y-6">
      <Panel
        className="relative overflow-hidden"
        title={application ? `${application.clientName} Application` : "Application Details"}
        subtitle="Manage application details, move stages, and review complete stage history."
        action={
          <div className="flex flex-wrap gap-3">
            <Badge variant="dark">{application.targetCountry}</Badge>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => navigate(baseRoute)}
            >
              Back to Applications
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => {
                if (application) {
                  setForm(mapApplicationToForm(application));
                }
                setIsEditOpen(true);
              }}
            >
              Edit Application
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
              disabled={moveStageMutation.isPending}
              onClick={async () => {
                if (!application) return;
                try {
                  await moveStageMutation.mutateAsync({
                    id: application.id,
                    direction: "previous",
                    note: "Moved to previous stage.",
                  });
                  toast.success("Application moved to previous stage.");
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Unable to move the application.",
                  );
                }
              }}
            >
              Previous Stage
            </button>
            <button
              type="button"
              className="btn-gold"
              disabled={moveStageMutation.isPending}
              onClick={async () => {
                if (!application) return;
                try {
                  await moveStageMutation.mutateAsync({
                    id: application.id,
                    direction: "next",
                    note: "Moved to next stage.",
                  });
                  toast.success("Application moved to next stage.");
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Unable to move the application.",
                  );
                }
              }}
            >
              Next Stage
            </button>
            {area === "admin" && application ? (
              <button
                type="button"
                className="rounded-xl border border-destructive/20 px-4 py-2 text-sm font-semibold text-destructive"
                onClick={async () => {
                  const confirmed = await dialogs.confirm({
                    title: "Delete application?",
                    description: `Delete the application for ${application.clientName}. This action cannot be undone.`,
                    confirmLabel: "Delete",
                    tone: "destructive",
                  });

                  if (!confirmed) {
                    return;
                  }

                  try {
                    await deleteApplicationMutation.mutateAsync(application.id);
                    toast.success("Application deleted.");
                    navigate(baseRoute);
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Unable to delete the application.",
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
        {application ? (
          <div className="space-y-6">
            <ApplicationPipeline application={application} />
            <ApplicationOverview application={application} />
            <ApplicationHistory history={history} />
          </div>
        ) : (
          <div className="space-y-5">
            <Skeleton className="h-28 rounded-[24px] bg-slate-200" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <Skeleton className="h-3 w-24 rounded-full bg-slate-200" />
                  <Skeleton className="mt-4 h-6 w-3/4 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        )}
        {isOverlayVisible ? <LoadingOverlay label="Loading application..." /> : null}
      </Panel>

      <AppDialog
        open={isEditOpen && Boolean(form)}
        onOpenChange={setIsEditOpen}
        title="Edit Application"
        description="Update application details, assignment, and filing progress."
        contentClassName="max-w-5xl overflow-y-auto sm:max-h-[90vh]"
      >
        <ApplicationForm
          form={form ?? createEmptyApplicationForm()}
          onChange={setForm}
          clients={(clientsQuery.data?.items ?? []).map((client) => ({
            id: client.id,
            name: client.fullName,
          }))}
          staffUsers={staffUsers.map((user) => ({ id: user.id, name: user.name }))}
          area={area}
          onSubmit={async () => {
            if (!form) return;
            try {
              await upsertApplicationMutation.mutateAsync(form);
              toast.success("Application updated.");
              setIsEditOpen(false);
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Unable to update the application.",
              );
            }
          }}
          isSubmitting={upsertApplicationMutation.isPending}
        />
      </AppDialog>
    </div>
  );
}

export function ClientApplicationPage() {
  const applicationsQuery = useOwnApplications(true);

  if (applicationsQuery.isError) {
    return <EmptyHint message="Unable to load your applications." tone="error" />;
  }

  const items = applicationsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Panel
        className="relative overflow-hidden"
        title="My Applications"
        subtitle="Track your application pipeline, current stage, deadlines, and stage-by-stage history."
        action={<StatusBadge tone="success">Own progress only</StatusBadge>}
      >
        <div className="space-y-5">
          {items.length === 0 ? (
            <EmptyHint message="No applications have been created for your account yet." />
          ) : (
            items.map((item) => (
              <div
                key={item.application.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-display font-extrabold text-slate-950">
                      {item.application.targetCountry}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.application.serviceType}
                      {item.application.universityProgram
                        ? ` · ${item.application.universityProgram}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone={getStatusTone(item.application.status)}>
                      {item.application.status}
                    </StatusBadge>
                    <StatusBadge tone={getPriorityTone(item.application.priority)}>
                      {item.application.priority}
                    </StatusBadge>
                  </div>
                </div>
                <div className="mt-5">
                  <ApplicationPipeline application={item.application} compact />
                </div>
                <div className="mt-5">
                  <ApplicationHistory history={item.history} />
                </div>
              </div>
            ))
          )}
        </div>
        {applicationsQuery.isFetching && items.length > 0 ? (
          <LoadingOverlay label="Refreshing application progress..." />
        ) : null}
      </Panel>
    </div>
  );
}

export function ClientApplicationsTab({
  area,
  clientId,
}: {
  area: "admin" | "staff";
  clientId: string;
}) {
  const applicationsQuery = useApplications({
    enabled: true,
    page: 1,
    pageSize: 20,
    search: "",
    clientId,
  });

  const detailRoute =
    area === "admin"
      ? "/dashboard/admin/applications/:applicationId"
      : "/dashboard/staff/applications/:applicationId";

  if (applicationsQuery.isError) {
    return <EmptyHint message="Unable to load the client applications." tone="error" />;
  }

  const items = applicationsQuery.data?.items ?? [];

  return (
    <div className="relative space-y-4">
      {items.length === 0 ? (
        <EmptyHint message="No applications are linked to this client yet." />
      ) : (
        items.map((application) => (
          <div
            key={application.id}
            className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-display font-extrabold text-slate-950">
                  {application.targetCountry}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {application.serviceType}
                  {application.universityProgram ? ` · ${application.universityProgram}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={getStatusTone(application.status)}>
                  {application.status}
                </StatusBadge>
                <Link
                  to={buildPath(detailRoute, { params: { applicationId: application.id } })}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Open
                </Link>
              </div>
            </div>
            <div className="mt-4">
              <ApplicationPipeline application={application} compact />
            </div>
          </div>
        ))
      )}
      {applicationsQuery.isFetching && items.length > 0 ? (
        <LoadingOverlay label="Refreshing client applications..." inset="rounded-[24px]" />
      ) : null}
    </div>
  );
}

function ApplicationPipeline({
  application,
  compact = false,
}: {
  application: Application;
  compact?: boolean;
}) {
  const currentIndex = APPLICATION_STAGES.indexOf(application.currentStage);

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Pipeline Progress
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {application.currentStage}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-display font-extrabold text-slate-950">
            {application.progressPercent}%
          </div>
          <div className="text-xs text-slate-500">
            {application.isOverdue
              ? "Deadline overdue"
              : `Deadline: ${formatDate(application.deadline)}`}
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-gold transition-all"
          style={{ width: `${application.progressPercent}%` }}
        />
      </div>

      <div
        className={`mt-5 grid gap-3 ${compact ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-3 xl:grid-cols-4"}`}
      >
        {APPLICATION_STAGES.map((stage, index) => {
          const state =
            index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming";

          return (
            <div
              key={stage}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                state === "done"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : state === "current"
                    ? "border-gold/60 bg-gold/10 text-slate-900"
                    : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                {state === "done" ? "Done" : state === "current" ? "Current" : "Upcoming"}
              </div>
              <div className="mt-2 font-semibold">{stage}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ApplicationHistory({ history }: { history: ApplicationStageHistory[] }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Stage History
        </div>
        <h3 className="mt-2 text-xl font-display font-extrabold text-slate-950">Timeline</h3>
      </div>

      {history.length === 0 ? (
        <EmptyHint message="No stage history recorded yet." />
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {entry.oldStage ? `${entry.oldStage} → ${entry.newStage}` : entry.newStage}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {entry.changedByName || "System"} · {formatDateTime(entry.changedAt)}
                  </div>
                </div>
                <StatusBadge tone="info">Stage update</StatusBadge>
              </div>
              {entry.note ? (
                <p className="mt-3 text-sm leading-6 text-slate-600">{entry.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationOverview({ application }: { application: Application }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Application Details
        </div>
        <h3 className="mt-2 text-xl font-display font-extrabold text-slate-950">Overview</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ReadOnlyField label="Client" value={application.clientName} />
        <ReadOnlyField label="Email" value={application.clientEmail || "—"} />
        <ReadOnlyField label="Phone" value={application.clientPhone || "—"} />
        <ReadOnlyField label="Target Country" value={application.targetCountry} />
        <ReadOnlyField label="Service Type" value={application.serviceType} />
        <ReadOnlyField label="University / Program" value={application.universityProgram || "—"} />
        <ReadOnlyField
          label="Assigned Counselor"
          value={application.assignedStaffName || "Unassigned"}
        />
        <ReadOnlyField label="Stage" value={application.currentStage} />
        <ReadOnlyField label="Status" value={application.status} />
        <ReadOnlyField label="Priority" value={application.priority} />
        <ReadOnlyField label="Deadline" value={formatDate(application.deadline)} />
        <ReadOnlyField label="Progress" value={`${application.progressPercent}%`} />
      </div>
      <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
        {application.notes || "No notes added yet."}
      </div>
    </div>
  );
}

function ApplicationForm({
  form,
  onChange,
  clients,
  staffUsers,
  area,
  onSubmit,
  isSubmitting,
  lockClient = false,
}: {
  form: UpsertApplicationInput;
  onChange: (value: UpsertApplicationInput) => void;
  clients: Array<{ id: string; name: string }>;
  staffUsers: Array<{ id: string; name: string }>;
  area: "admin" | "staff";
  onSubmit: () => void;
  isSubmitting: boolean;
  lockClient?: boolean;
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
        <SelectField
          label="Client"
          value={form.clientId}
          disabled={lockClient}
          onChange={(clientId) => onChange({ ...form, clientId })}
          options={clients.map((client) => ({ value: client.id, label: client.name }))}
        />
        <TextField
          label="Target Country"
          value={form.targetCountry}
          onChange={(targetCountry) => onChange({ ...form, targetCountry })}
        />
        <TextField
          label="Service Type"
          value={form.serviceType}
          onChange={(serviceType) => onChange({ ...form, serviceType })}
        />
        <TextField
          label="University / Program"
          value={form.universityProgram}
          onChange={(universityProgram) => onChange({ ...form, universityProgram })}
        />
        <SelectField
          label="Assigned Counselor"
          value={form.assignedStaffUserId ?? ""}
          disabled={area !== "admin"}
          onChange={(assignedStaffUserId) =>
            onChange({ ...form, assignedStaffUserId: assignedStaffUserId || null })
          }
          options={[
            { value: "", label: area === "admin" ? "Unassigned" : "Assigned to me" },
            ...staffUsers.map((user) => ({ value: user.id, label: user.name })),
          ]}
        />
        <SelectField
          label="Current Stage"
          value={form.currentStage}
          onChange={(currentStage) =>
            onChange({
              ...form,
              currentStage: currentStage as UpsertApplicationInput["currentStage"],
            })
          }
          options={APPLICATION_STAGES.map((stage) => ({ value: stage, label: stage }))}
        />
        <SelectField
          label="Status"
          value={form.status}
          onChange={(status) =>
            onChange({ ...form, status: status as UpsertApplicationInput["status"] })
          }
          options={APPLICATION_STATUS_OPTIONS.map((status) => ({ value: status, label: status }))}
        />
        <SelectField
          label="Priority"
          value={form.priority}
          onChange={(priority) =>
            onChange({ ...form, priority: priority as UpsertApplicationInput["priority"] })
          }
          options={PRIORITY_OPTIONS.map((priority) => ({ value: priority, label: priority }))}
        />
        <TextField
          label="Deadline"
          type="date"
          value={form.deadline}
          onChange={(deadline) => onChange({ ...form, deadline })}
        />
      </div>

      <TextAreaField
        label="Notes"
        value={form.notes}
        onChange={(notes) => onChange({ ...form, notes })}
      />
      <TextAreaField
        label="History Note"
        value={form.historyNote ?? ""}
        onChange={(historyNote) => onChange({ ...form, historyNote })}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-gold min-w-[180px] justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Application"}
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
        rows={4}
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
