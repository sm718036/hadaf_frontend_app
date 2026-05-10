import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectMenu } from "@/components/ui/select-menu";
import { useCurrentClient } from "@/features/client-auth/use-client-auth";
import { useApplications, useOwnApplications } from "@/features/applications/use-applications";
import { useClients } from "@/features/clients/use-clients";
import { useDashboardAccess } from "@/features/dashboard/dashboard-context";
import { DataTable, StatusBadge } from "@/features/dashboard/dashboard-layout";
import { EmptyHint, PaginationControls, Panel, TableToolbar } from "@/features/dashboard/dashboard-ui";
import { useInternalUsers } from "@/features/internal-users/use-users";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  DOCUMENT_STATUSES,
  PAYMENT_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type AppointmentStatus,
  type AppointmentType,
  type DocumentStatus,
  type PaymentStatus,
  type TaskPriority,
  type TaskStatus,
  type UpsertAppointmentInput,
  type UpsertDocumentInput,
  type UpsertPaymentInput,
  type UpsertTaskInput,
} from "./operations.schemas";
import {
  useAppointments,
  useCreateMessage,
  useCreateOwnDocument,
  useCreateOwnMessage,
  useDeleteAppointment,
  useDeleteDocument,
  useDeletePayment,
  useDeleteTask,
  useDocuments,
  useMessages,
  useOwnAppointments,
  useOwnDocuments,
  useOwnMessages,
  useOwnPayments,
  usePayments,
  useTasks,
  useUpsertAppointment,
  useUpsertDocument,
  useUpsertPayment,
  useUpsertTask,
  useUploadDocumentFile,
  useUploadOwnDocumentFile,
} from "./use-operations";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function makeSelectOptions(values: readonly string[]) {
  return values.map((value) => ({
    value,
    label: value.replaceAll("_", " "),
  }));
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function inputClassName() {
  return "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none";
}

function createEmptyTaskForm(assignedStaffUserId: string | null): UpsertTaskInput {
  return {
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
    assignedStaffUserId,
    relatedClientId: null,
    relatedLeadId: null,
    relatedApplicationId: null,
  };
}

function createEmptyDocumentForm(status: DocumentStatus): UpsertDocumentInput {
  return {
    clientId: "",
    applicationId: null,
    title: "",
    documentType: "",
    status,
    fileUrl: "",
    fileName: "",
    fileSize: null,
    contentType: "",
    notes: "",
    visibleToClient: true,
  };
}

function createEmptyAppointmentForm(assignedStaffUserId: string | null): UpsertAppointmentInput {
  return {
    clientId: "",
    applicationId: null,
    assignedStaffUserId,
    title: "",
    appointmentType: "consultation",
    status: "scheduled",
    scheduledAt: "",
    durationMinutes: 30,
    location: "",
    meetingLink: "",
    notes: "",
  };
}

function createEmptyPaymentForm(): UpsertPaymentInput {
  return {
    clientId: "",
    applicationId: null,
    title: "",
    amount: 0,
    currency: "PKR",
    status: "pending",
    dueDate: "",
    paidAt: "",
    paymentMethod: "",
    referenceNumber: "",
    notes: "",
  };
}

function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl overflow-y-auto border-slate-200 p-0 sm:max-h-[90vh]">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle className="font-display text-2xl font-extrabold text-slate-950">
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="px-6 py-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${inputClassName()} resize-y`}
    />
  );
}

function InternalFilters({
  searchInput,
  setSearchInput,
  status,
  setStatus,
  staffId,
  setStaffId,
  staffUsers,
  summary,
}: {
  searchInput: string;
  setSearchInput: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  staffId: string;
  setStaffId: (value: string) => void;
  staffUsers: Array<{ id: string; name: string }>;
  summary: string;
}) {
  return (
    <>
      <TableToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Search records..."
        summary={summary}
      />
      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <SelectMenu
          value={status}
          onValueChange={setStatus}
          className="h-auto bg-slate-50 py-3"
          options={[
            { value: "", label: "All statuses" },
            ...makeSelectOptions([
              ...TASK_STATUSES,
              ...DOCUMENT_STATUSES,
              ...APPOINTMENT_STATUSES,
              ...PAYMENT_STATUSES,
            ]),
          ]}
        />
        <SelectMenu
          value={staffId}
          onValueChange={setStaffId}
          className="h-auto bg-slate-50 py-3"
          options={[
            { value: "", label: "All counselors" },
            ...staffUsers.map((user) => ({ value: user.id, label: user.name })),
          ]}
        />
      </div>
    </>
  );
}

function FileLink({ url, label }: { url: string | null; label: string | null }) {
  if (!url) return "—";
  return (
    <a href={url} target="_blank" rel="noreferrer" className="font-semibold text-sky-700">
      {label || "Open file"}
    </a>
  );
}

export function TaskListPage({ area }: { area: "admin" | "staff" }) {
  const access = useDashboardAccess();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [status, setStatus] = useState("");
  const [staffId, setStaffId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<UpsertTaskInput>(
    createEmptyTaskForm(area === "staff" ? access.currentUser.id : null),
  );
  const tasksQuery = useTasks({
    enabled: access.canReadTasks,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search: deferredSearch,
    status,
    staffId,
  });
  const upsertTaskMutation = useUpsertTask();
  const deleteTaskMutation = useDeleteTask();
  const staffUsersQuery = useInternalUsers({
    enabled: area === "admin",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const clientsQuery = useClients({
    enabled: true,
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
  }, [deferredSearch, status, staffId]);

  return (
    <div className="space-y-6">
      <Panel
        title="Tasks"
        subtitle="Track counselor follow-ups, internal work items, and client-linked actions."
        action={
          <button
            type="button"
            className="btn-gold"
            onClick={() => {
              setForm(createEmptyTaskForm(area === "staff" ? access.currentUser.id : null));
              setIsCreateOpen(true);
            }}
          >
            Create Task
          </button>
        }
      >
        <InternalFilters
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          status={status}
          setStatus={setStatus}
          staffId={staffId}
          setStaffId={setStaffId}
          staffUsers={staffUsers.map((user) => ({ id: user.id, name: user.name }))}
          summary={`${tasksQuery.data?.total ?? 0} matching tasks`}
        />
        {tasksQuery.isLoading ? (
          <EmptyHint message="Loading tasks..." loading />
        ) : tasksQuery.isError ? (
          <EmptyHint message="Unable to load tasks." tone="error" />
        ) : (
          <>
            <DataTable
              columns={["Task", "Client", "Assigned", "Priority", "Status", "Due", "Action"]}
              rows={(tasksQuery.data?.items ?? []).map((task) => [
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.description || "No description"}</p>
                </div>,
                task.relatedClientName || "—",
                task.assignedStaffName || "Unassigned",
                <StatusBadge tone={task.priority === "urgent" || task.priority === "high" ? "warning" : "neutral"}>
                  {task.priority}
                </StatusBadge>,
                <StatusBadge tone={task.status === "completed" ? "success" : task.status === "in_progress" ? "info" : "neutral"}>
                  {task.status.replaceAll("_", " ")}
                </StatusBadge>,
                formatDate(task.dueDate),
                <button
                  type="button"
                  className="rounded-xl border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive"
                  onClick={async () => {
                    try {
                      await deleteTaskMutation.mutateAsync(task.id);
                      toast.success("Task deleted.");
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Unable to delete task.");
                    }
                  }}
                >
                  Delete
                </button>,
              ])}
              emptyMessage="No tasks found."
            />
            <PaginationControls
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              total={tasksQuery.data?.total ?? 0}
              totalPages={tasksQuery.data?.totalPages ?? 1}
              onPageChange={setPage}
            />
          </>
        )}
        <FormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          title="Create Task"
          description="Create a counselor or internal task without leaving the table."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Title">
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputClassName()} />
            </FormField>
            <FormField label="Due Date">
              <input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} className={inputClassName()} />
            </FormField>
            <FormField label="Status">
              <SelectMenu
                value={form.status}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, status: value as TaskStatus }))
                }
                options={makeSelectOptions(TASK_STATUSES)}
              />
            </FormField>
            <FormField label="Priority">
              <SelectMenu
                value={form.priority}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, priority: value as TaskPriority }))
                }
                options={makeSelectOptions(TASK_PRIORITIES)}
              />
            </FormField>
            <FormField label="Assigned Counselor">
              <SelectMenu
                value={form.assignedStaffUserId || ""}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, assignedStaffUserId: value || null }))
                }
                options={[
                  { value: "", label: "Unassigned" },
                  ...staffUsers.map((user) => ({ value: user.id, label: user.name })),
                ]}
              />
            </FormField>
            <FormField label="Related Client">
              <SelectMenu
                value={form.relatedClientId || ""}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, relatedClientId: value || null }))
                }
                options={[
                  { value: "", label: "None" },
                  ...(clientsQuery.data?.items ?? []).map((client) => ({
                    value: client.id,
                    label: client.fullName,
                  })),
                ]}
              />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Description">
              <TextArea value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
            </FormField>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="btn-gold"
              onClick={async () => {
                try {
                  await upsertTaskMutation.mutateAsync(form);
                  toast.success("Task saved.");
                  setForm(createEmptyTaskForm(area === "staff" ? access.currentUser.id : null));
                  setIsCreateOpen(false);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to save task.");
                }
              }}
            >
              Save Task
            </button>
          </div>
        </FormDialog>
      </Panel>
    </div>
  );
}

export function DocumentListPage({ mode, area = "staff" }: { mode: "internal" | "client"; area?: "admin" | "staff" }) {
  const access = mode === "internal" ? useDashboardAccess() : null;
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [status, setStatus] = useState("");
  const [staffId, setStaffId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState<UpsertDocumentInput>(createEmptyDocumentForm("requested"));
  const staffUsersQuery = useInternalUsers({ enabled: mode === "internal" && area === "admin", page: 1, pageSize: 100, search: "" });
  const clientsQuery = useClients({ enabled: mode === "internal", page: 1, pageSize: 100, search: "" });
  const applicationsQuery = useApplications({
    enabled: mode === "internal",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const ownApplicationsQuery = useOwnApplications(mode === "client");
  const documentsQuery = useDocuments({
    enabled: mode === "internal" && !!access?.canReadDocuments,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search: deferredSearch,
    status,
    staffId,
  });
  const ownDocumentsQuery = useOwnDocuments(mode === "client");
  const upsertDocumentMutation = useUpsertDocument();
  const createOwnDocumentMutation = useCreateOwnDocument();
  const uploadDocumentMutation = useUploadDocumentFile();
  const uploadOwnDocumentMutation = useUploadOwnDocumentFile();
  const deleteDocumentMutation = useDeleteDocument();
  const ownApplicationOptions = (ownApplicationsQuery.data ?? []).map((item) => item.application);

  const staffUsers = useMemo(
    () => (staffUsersQuery.data?.items ?? []).filter((user) => user.role === "staff"),
    [staffUsersQuery.data],
  );

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, status, staffId]);

  const items = mode === "internal" ? documentsQuery.data?.items ?? [] : ownDocumentsQuery.data ?? [];

  return (
    <Panel
      title={mode === "internal" ? "Documents" : "My Documents"}
      subtitle={mode === "internal" ? "Track document requests, uploads, and verification." : "View required documents and upload files for your case."}
      action={
        <button
          type="button"
          className="btn-gold"
          onClick={() => {
            setSelectedFile(null);
            setForm(createEmptyDocumentForm(mode === "internal" ? "requested" : "received"));
            setIsCreateOpen(true);
          }}
        >
          {mode === "internal" ? "Create Document" : "Upload Document"}
        </button>
      }
    >
      {mode === "internal" ? (
        <InternalFilters
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          status={status}
          setStatus={setStatus}
          staffId={staffId}
          setStaffId={setStaffId}
          staffUsers={staffUsers.map((user) => ({ id: user.id, name: user.name }))}
          summary={`${documentsQuery.data?.total ?? 0} matching documents`}
        />
      ) : null}

      {(mode === "internal" ? documentsQuery.isLoading : ownDocumentsQuery.isLoading) ? (
        <EmptyHint message="Loading documents..." loading />
      ) : (
        <DataTable
          columns={["Title", "Client", "Type", "Status", "File", "Visibility", "Uploaded", "Action"]}
          rows={items.map((document) => [
            <div className="text-left">
              <p className="font-semibold text-slate-900">{document.title}</p>
              <p className="text-xs text-slate-500">{document.notes || "No notes"}</p>
            </div>,
            document.clientName,
            document.documentType,
            <StatusBadge tone={document.status === "verified" ? "success" : document.status === "rejected" ? "warning" : "info"}>
              {document.status}
            </StatusBadge>,
            <FileLink url={document.fileUrl} label={document.fileName} />,
            document.visibleToClient ? <Badge variant="success">Client visible</Badge> : <Badge variant="light">Internal only</Badge>,
            document.uploadedByClientName || document.uploadedByInternalName || "—",
            mode === "internal" ? (
              <button
                type="button"
                className="rounded-xl border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive"
                onClick={async () => {
                  try {
                    await deleteDocumentMutation.mutateAsync(document.id);
                    toast.success("Document deleted.");
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Unable to delete document.");
                  }
                }}
              >
                Delete
              </button>
            ) : (
              "—"
            ),
          ])}
          emptyMessage="No documents found."
        />
      )}

      {mode === "internal" && documentsQuery.data ? (
        <PaginationControls
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          total={documentsQuery.data.total}
          totalPages={documentsQuery.data.totalPages}
          onPageChange={setPage}
        />
      ) : null}

      <FormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title={mode === "internal" ? "Create Document Record" : "Upload Document"}
        description={
          mode === "internal"
            ? "Create or request a document record without leaving the document list."
            : "Upload a document from your portal without leaving the page."
        }
      >
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {mode === "internal" ? (
            <FormField label="Client">
              <SelectMenu
                value={form.clientId}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, clientId: value }))
                }
                options={[
                  { value: "", label: "Select client" },
                  ...(clientsQuery.data?.items ?? []).map((client) => ({
                    value: client.id,
                    label: client.fullName,
                  })),
                ]}
              />
            </FormField>
          ) : null}
          <FormField label="Application">
            <SelectMenu
              value={form.applicationId || ""}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, applicationId: value || null }))
              }
              options={[
                { value: "", label: "Optional" },
                ...((mode === "internal"
                  ? applicationsQuery.data?.items ?? []
                  : ownApplicationOptions
                ).map((application) => ({
                  value: application.id,
                  label: `${application.clientName} · ${application.targetCountry}`,
                })) as Array<{ value: string; label: string }>),
              ]}
            />
          </FormField>
          <FormField label="Title">
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputClassName()} />
          </FormField>
          <FormField label="Document Type">
            <input value={form.documentType} onChange={(event) => setForm((current) => ({ ...current, documentType: event.target.value }))} className={inputClassName()} />
          </FormField>
          {mode === "internal" ? (
            <FormField label="Status">
              <SelectMenu
                value={form.status}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, status: value as DocumentStatus }))
                }
                options={makeSelectOptions(DOCUMENT_STATUSES)}
              />
            </FormField>
          ) : null}
          <FormField label="File">
            <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} className={inputClassName()} />
          </FormField>
        </div>
        <div className="mt-4">
          <FormField label="Notes">
            <TextArea value={form.notes} onChange={(value) => setForm((current) => ({ ...current, notes: value }))} />
          </FormField>
        </div>
        {mode === "internal" ? (
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.visibleToClient} onChange={(event) => setForm((current) => ({ ...current, visibleToClient: event.target.checked }))} />
            Visible to client
          </label>
        ) : null}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="btn-gold"
            onClick={async () => {
              try {
                let upload = null;
                if (selectedFile) {
                  upload =
                    mode === "internal"
                      ? await uploadDocumentMutation.mutateAsync(selectedFile)
                      : await uploadOwnDocumentMutation.mutateAsync(selectedFile);
                }

                const payload = {
                  ...form,
                  fileUrl: upload?.src || form.fileUrl,
                  fileName: upload?.fileName || form.fileName,
                  fileSize: upload?.size ?? form.fileSize,
                  contentType: upload?.contentType || form.contentType,
                };

                if (mode === "internal") {
                  await upsertDocumentMutation.mutateAsync(payload);
                } else {
                  await createOwnDocumentMutation.mutateAsync({
                    applicationId: payload.applicationId,
                    title: payload.title,
                    documentType: payload.documentType,
                    fileUrl: payload.fileUrl,
                    fileName: payload.fileName,
                    fileSize: payload.fileSize,
                    contentType: payload.contentType,
                    notes: payload.notes,
                  });
                }

                toast.success("Document saved.");
                setSelectedFile(null);
                setForm(createEmptyDocumentForm(mode === "internal" ? "requested" : "received"));
                setIsCreateOpen(false);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to save document.");
              }
            }}
          >
            {mode === "internal" ? "Save Document" : "Upload Document"}
          </button>
        </div>
      </FormDialog>
    </Panel>
  );
}

export function AppointmentListPage({ mode, area = "staff" }: { mode: "internal" | "client"; area?: "admin" | "staff" }) {
  const access = mode === "internal" ? useDashboardAccess() : null;
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [status, setStatus] = useState("");
  const [staffId, setStaffId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<UpsertAppointmentInput>(
    createEmptyAppointmentForm(area === "staff" ? access?.currentUser.id || null : null),
  );
  const staffUsersQuery = useInternalUsers({ enabled: mode === "internal" && area === "admin", page: 1, pageSize: 100, search: "" });
  const clientsQuery = useClients({ enabled: mode === "internal", page: 1, pageSize: 100, search: "" });
  const applicationsQuery = useApplications({ enabled: mode === "internal", page: 1, pageSize: 100, search: "" });
  const appointmentsQuery = useAppointments({
    enabled: mode === "internal" && !!access?.canReadAppointments,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search: deferredSearch,
    status,
    staffId,
  });
  const ownAppointmentsQuery = useOwnAppointments(mode === "client");
  const upsertAppointmentMutation = useUpsertAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();

  const staffUsers = useMemo(() => (staffUsersQuery.data?.items ?? []).filter((user) => user.role === "staff"), [staffUsersQuery.data]);
  useEffect(() => {
    setPage(1);
  }, [deferredSearch, status, staffId]);

  const items = mode === "internal" ? appointmentsQuery.data?.items ?? [] : ownAppointmentsQuery.data ?? [];

  return (
    <Panel
      title={mode === "internal" ? "Appointments" : "My Appointments"}
      subtitle="Manage consultations, embassy prep sessions, and follow-up meetings."
      action={
        mode === "internal" ? (
          <button
            type="button"
            className="btn-gold"
            onClick={() => {
              setForm(
                createEmptyAppointmentForm(
                  area === "staff" ? access?.currentUser.id || null : null,
                ),
              );
              setIsCreateOpen(true);
            }}
          >
            Schedule Appointment
          </button>
        ) : undefined
      }
    >
      {mode === "internal" ? (
        <InternalFilters
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          status={status}
          setStatus={setStatus}
          staffId={staffId}
          setStaffId={setStaffId}
          staffUsers={staffUsers.map((user) => ({ id: user.id, name: user.name }))}
          summary={`${appointmentsQuery.data?.total ?? 0} matching appointments`}
        />
      ) : null}
      {(mode === "internal" ? appointmentsQuery.isLoading : ownAppointmentsQuery.isLoading) ? (
        <EmptyHint message="Loading appointments..." loading />
      ) : (
        <DataTable
          columns={["Title", "Client", "Type", "Status", "Scheduled", "Counselor", "Action"]}
          rows={items.map((appointment) => [
            <div className="text-left">
              <p className="font-semibold text-slate-900">{appointment.title}</p>
              <p className="text-xs text-slate-500">{appointment.location || appointment.meetingLink || "No location"}</p>
            </div>,
            appointment.clientName,
            appointment.appointmentType.replaceAll("_", " "),
            <StatusBadge tone={appointment.status === "completed" ? "success" : appointment.status === "cancelled" ? "warning" : "info"}>
              {appointment.status.replaceAll("_", " ")}
            </StatusBadge>,
            formatDateTime(appointment.scheduledAt),
            appointment.assignedStaffName || "Unassigned",
            mode === "internal" ? (
              <button type="button" className="rounded-xl border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive" onClick={async () => {
                try {
                  await deleteAppointmentMutation.mutateAsync(appointment.id);
                  toast.success("Appointment deleted.");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to delete appointment.");
                }
              }}>
                Delete
              </button>
            ) : "—",
          ])}
          emptyMessage="No appointments found."
        />
      )}
      {mode === "internal" && appointmentsQuery.data ? (
        <PaginationControls page={page} pageSize={DEFAULT_PAGE_SIZE} total={appointmentsQuery.data.total} totalPages={appointmentsQuery.data.totalPages} onPageChange={setPage} />
      ) : null}

      {mode === "internal" ? (
        <FormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          title="Schedule Appointment"
          description="Create a new meeting record without leaving the appointment list."
        >
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FormField label="Client">
              <SelectMenu
                value={form.clientId}
                onValueChange={(value) => setForm((current) => ({ ...current, clientId: value }))}
                options={[
                  { value: "", label: "Select client" },
                  ...(clientsQuery.data?.items ?? []).map((client) => ({
                    value: client.id,
                    label: client.fullName,
                  })),
                ]}
              />
            </FormField>
            <FormField label="Application">
              <SelectMenu
                value={form.applicationId || ""}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, applicationId: value || null }))
                }
                options={[
                  { value: "", label: "Optional" },
                  ...(applicationsQuery.data?.items ?? []).map((application) => ({
                    value: application.id,
                    label: `${application.clientName} · ${application.targetCountry}`,
                  })),
                ]}
              />
            </FormField>
            <FormField label="Title">
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputClassName()} />
            </FormField>
            <FormField label="Scheduled At">
              <input type="datetime-local" value={form.scheduledAt} onChange={(event) => setForm((current) => ({ ...current, scheduledAt: event.target.value }))} className={inputClassName()} />
            </FormField>
            <FormField label="Type">
              <SelectMenu
                value={form.appointmentType}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    appointmentType: value as AppointmentType,
                  }))
                }
                options={makeSelectOptions(APPOINTMENT_TYPES)}
              />
            </FormField>
            <FormField label="Status">
              <SelectMenu
                value={form.status}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, status: value as AppointmentStatus }))
                }
                options={makeSelectOptions(APPOINTMENT_STATUSES)}
              />
            </FormField>
            <FormField label="Counselor">
              <SelectMenu
                value={form.assignedStaffUserId || ""}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, assignedStaffUserId: value || null }))
                }
                options={[
                  { value: "", label: "Unassigned" },
                  ...staffUsers.map((user) => ({ value: user.id, label: user.name })),
                ]}
              />
            </FormField>
            <FormField label="Duration">
              <input type="number" min="15" max="480" value={form.durationMinutes} onChange={(event) => setForm((current) => ({ ...current, durationMinutes: Number(event.target.value) || 30 }))} className={inputClassName()} />
            </FormField>
            <FormField label="Location">
              <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className={inputClassName()} />
            </FormField>
            <FormField label="Meeting Link">
              <input value={form.meetingLink} onChange={(event) => setForm((current) => ({ ...current, meetingLink: event.target.value }))} className={inputClassName()} />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Notes">
              <TextArea value={form.notes} onChange={(value) => setForm((current) => ({ ...current, notes: value }))} />
            </FormField>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="button" className="btn-gold" onClick={async () => {
              try {
                await upsertAppointmentMutation.mutateAsync(form);
                toast.success("Appointment saved.");
                setForm(
                  createEmptyAppointmentForm(
                    area === "staff" ? access?.currentUser.id || null : null,
                  ),
                );
                setIsCreateOpen(false);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to save appointment.");
              }
            }}>
              Save Appointment
            </button>
          </div>
        </FormDialog>
      ) : null}
    </Panel>
  );
}

export function PaymentListPage({ mode, area = "staff" }: { mode: "internal" | "client"; area?: "admin" | "staff" }) {
  const access = mode === "internal" ? useDashboardAccess() : null;
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [status, setStatus] = useState("");
  const [staffId, setStaffId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<UpsertPaymentInput>(createEmptyPaymentForm());
  const staffUsersQuery = useInternalUsers({ enabled: mode === "internal" && area === "admin", page: 1, pageSize: 100, search: "" });
  const clientsQuery = useClients({ enabled: mode === "internal", page: 1, pageSize: 100, search: "" });
  const applicationsQuery = useApplications({ enabled: mode === "internal", page: 1, pageSize: 100, search: "" });
  const paymentsQuery = usePayments({
    enabled: mode === "internal" && !!access?.canReadPayments,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search: deferredSearch,
    status,
    staffId,
  });
  const ownPaymentsQuery = useOwnPayments(mode === "client");
  const upsertPaymentMutation = useUpsertPayment();
  const deletePaymentMutation = useDeletePayment();
  const staffUsers = useMemo(() => (staffUsersQuery.data?.items ?? []).filter((user) => user.role === "staff"), [staffUsersQuery.data]);
  useEffect(() => { setPage(1); }, [deferredSearch, status, staffId]);
  const items = mode === "internal" ? paymentsQuery.data?.items ?? [] : ownPaymentsQuery.data ?? [];

  return (
    <Panel
      title={mode === "internal" ? "Payments" : "My Payments"}
      subtitle="Track invoices, due dates, and payment status for each client case."
      action={
        mode === "internal" ? (
          <button
            type="button"
            className="btn-gold"
            onClick={() => {
              setForm(createEmptyPaymentForm());
              setIsCreateOpen(true);
            }}
          >
            Create Payment
          </button>
        ) : undefined
      }
    >
      {mode === "internal" ? (
        <InternalFilters searchInput={searchInput} setSearchInput={setSearchInput} status={status} setStatus={setStatus} staffId={staffId} setStaffId={setStaffId} staffUsers={staffUsers.map((user) => ({ id: user.id, name: user.name }))} summary={`${paymentsQuery.data?.total ?? 0} matching payments`} />
      ) : null}
      {(mode === "internal" ? paymentsQuery.isLoading : ownPaymentsQuery.isLoading) ? (
        <EmptyHint message="Loading payments..." loading />
      ) : (
        <DataTable
          columns={["Title", "Client", "Amount", "Status", "Due", "Paid", "Action"]}
          rows={items.map((payment) => [
            <div className="text-left">
              <p className="font-semibold text-slate-900">{payment.title}</p>
              <p className="text-xs text-slate-500">{payment.notes || "No notes"}</p>
            </div>,
            payment.clientName,
            `${payment.currency} ${payment.amount.toLocaleString()}`,
            <StatusBadge tone={payment.status === "paid" ? "success" : payment.status === "overdue" ? "warning" : "info"}>
              {payment.status}
            </StatusBadge>,
            formatDate(payment.dueDate),
            formatDateTime(payment.paidAt),
            mode === "internal" ? (
              <button type="button" className="rounded-xl border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive" onClick={async () => {
                try {
                  await deletePaymentMutation.mutateAsync(payment.id);
                  toast.success("Payment deleted.");
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to delete payment.");
                }
              }}>
                Delete
              </button>
            ) : "—",
          ])}
          emptyMessage="No payments found."
        />
      )}
      {mode === "internal" && paymentsQuery.data ? <PaginationControls page={page} pageSize={DEFAULT_PAGE_SIZE} total={paymentsQuery.data.total} totalPages={paymentsQuery.data.totalPages} onPageChange={setPage} /> : null}
      {mode === "internal" ? (
        <FormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          title="Create Payment"
          description="Add a payment or invoice record without leaving the payment list."
        >
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FormField label="Client">
              <SelectMenu
                value={form.clientId}
                onValueChange={(value) => setForm((current) => ({ ...current, clientId: value }))}
                options={[
                  { value: "", label: "Select client" },
                  ...(clientsQuery.data?.items ?? []).map((client) => ({
                    value: client.id,
                    label: client.fullName,
                  })),
                ]}
              />
            </FormField>
            <FormField label="Application">
              <SelectMenu
                value={form.applicationId || ""}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, applicationId: value || null }))
                }
                options={[
                  { value: "", label: "Optional" },
                  ...(applicationsQuery.data?.items ?? []).map((application) => ({
                    value: application.id,
                    label: `${application.clientName} · ${application.targetCountry}`,
                  })),
                ]}
              />
            </FormField>
            <FormField label="Title">
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputClassName()} />
            </FormField>
            <FormField label="Amount">
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) || 0 }))} className={inputClassName()} />
            </FormField>
            <FormField label="Currency">
              <input value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))} className={inputClassName()} />
            </FormField>
            <FormField label="Status">
              <SelectMenu
                value={form.status}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, status: value as PaymentStatus }))
                }
                options={makeSelectOptions(PAYMENT_STATUSES)}
              />
            </FormField>
            <FormField label="Due Date">
              <input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} className={inputClassName()} />
            </FormField>
            <FormField label="Paid At">
              <input type="datetime-local" value={form.paidAt} onChange={(event) => setForm((current) => ({ ...current, paidAt: event.target.value }))} className={inputClassName()} />
            </FormField>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FormField label="Payment Method">
              <input value={form.paymentMethod} onChange={(event) => setForm((current) => ({ ...current, paymentMethod: event.target.value }))} className={inputClassName()} />
            </FormField>
            <FormField label="Reference Number">
              <input value={form.referenceNumber} onChange={(event) => setForm((current) => ({ ...current, referenceNumber: event.target.value }))} className={inputClassName()} />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Notes">
              <TextArea value={form.notes} onChange={(value) => setForm((current) => ({ ...current, notes: value }))} />
            </FormField>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="button" className="btn-gold" onClick={async () => {
              try {
                await upsertPaymentMutation.mutateAsync(form);
                toast.success("Payment saved.");
                setForm(createEmptyPaymentForm());
                setIsCreateOpen(false);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to save payment.");
              }
            }}>
              Save Payment
            </button>
          </div>
        </FormDialog>
      ) : null}
    </Panel>
  );
}

export function MessageListPage({ mode, area = "staff" }: { mode: "internal" | "client"; area?: "admin" | "staff" }) {
  const access = mode === "internal" ? useDashboardAccess() : null;
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [staffId, setStaffId] = useState("");
  const [clientId, setClientId] = useState("");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const clientsQuery = useClients({ enabled: mode === "internal", page: 1, pageSize: 100, search: "" });
  const applicationsQuery = useApplications({
    enabled: mode === "internal",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const ownApplicationsQuery = useOwnApplications(mode === "client");
  const staffUsersQuery = useInternalUsers({ enabled: mode === "internal" && area === "admin", page: 1, pageSize: 100, search: "" });
  const staffUsers = useMemo(() => (staffUsersQuery.data?.items ?? []).filter((user) => user.role === "staff"), [staffUsersQuery.data]);
  const messagesQuery = useMessages({
    enabled: mode === "internal" && !!access?.canReadMessages,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search: deferredSearch,
    clientId,
    applicationId: applicationId || "",
    staffId,
  });
  const ownMessagesQuery = useOwnMessages(mode === "client");
  const createMessageMutation = useCreateMessage();
  const createOwnMessageMutation = useCreateOwnMessage();
  const currentClientQuery = useCurrentClient();
  const ownApplicationOptions = (ownApplicationsQuery.data ?? []).map((item) => item.application);

  useEffect(() => { setPage(1); }, [deferredSearch, clientId, applicationId, staffId]);
  const items = mode === "internal" ? messagesQuery.data?.items ?? [] : ownMessagesQuery.data ?? [];

  return (
    <Panel
      title={mode === "internal" ? "Messages" : "Messages"}
      subtitle="Keep client conversations inside the portal with a single searchable history."
      action={
        <button
          type="button"
          className="btn-gold"
          onClick={() => {
            setBody("");
            setIsComposeOpen(true);
          }}
        >
          {mode === "internal" ? "Compose Reply" : "Send Message"}
        </button>
      }
    >
      {mode === "internal" ? (
        <>
          <TableToolbar searchValue={searchInput} onSearchChange={setSearchInput} searchPlaceholder="Search messages..." summary={`${messagesQuery.data?.total ?? 0} matching messages`} />
          <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <SelectMenu
              value={clientId}
              onValueChange={setClientId}
              className="h-auto bg-slate-50 py-3"
              options={[
                { value: "", label: "All clients" },
                ...(clientsQuery.data?.items ?? []).map((client) => ({
                  value: client.id,
                  label: client.fullName,
                })),
              ]}
            />
            <SelectMenu
              value={applicationId || ""}
              onValueChange={(value) => setApplicationId(value || null)}
              className="h-auto bg-slate-50 py-3"
              options={[
                { value: "", label: "All applications" },
                ...((mode === "internal"
                  ? applicationsQuery.data?.items ?? []
                  : ownApplicationOptions
                ).map((application) => ({
                  value: application.id,
                  label: `${application.clientName} · ${application.targetCountry}`,
                })) as Array<{ value: string; label: string }>),
              ]}
            />
            <SelectMenu
              value={staffId}
              onValueChange={setStaffId}
              className="h-auto bg-slate-50 py-3"
              options={[
                { value: "", label: "All counselors" },
                ...staffUsers.map((user) => ({ value: user.id, label: user.name })),
              ]}
            />
          </div>
        </>
      ) : null}
      {(mode === "internal" ? messagesQuery.isLoading : ownMessagesQuery.isLoading) ? (
        <EmptyHint message="Loading messages..." loading />
      ) : (
        <DataTable
          columns={["Client", "Sender", "Message", "When", "Status"]}
          rows={items.map((message) => [
            message.clientName,
            message.senderType === "client" ? message.senderClientName || "Client" : message.senderInternalUserName || "Staff",
            <div className="max-w-md text-left">{message.body}</div>,
            formatDateTime(message.createdAt),
            <StatusBadge tone={message.isRead ? "success" : "info"}>{message.isRead ? "read" : "unread"}</StatusBadge>,
          ])}
          emptyMessage="No messages found."
        />
      )}
      {mode === "internal" && messagesQuery.data ? <PaginationControls page={page} pageSize={DEFAULT_PAGE_SIZE} total={messagesQuery.data.total} totalPages={messagesQuery.data.totalPages} onPageChange={setPage} /> : null}
      <FormDialog
        open={isComposeOpen}
        onOpenChange={setIsComposeOpen}
        title={mode === "internal" ? "Send Internal Reply" : "Send Message"}
        description={
          mode === "internal"
            ? "Reply to a client conversation without leaving the message list."
            : "Send a message to the Hadaf team from your portal."
        }
      >
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {mode === "internal" ? (
            <FormField label="Client">
              <SelectMenu
                value={clientId}
                onValueChange={setClientId}
                options={[
                  { value: "", label: "Select client" },
                  ...(clientsQuery.data?.items ?? []).map((client) => ({
                    value: client.id,
                    label: client.fullName,
                  })),
                ]}
              />
            </FormField>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Sending as {currentClientQuery.data?.name || "Client"}
            </div>
          )}
          <FormField label="Application">
            <SelectMenu
              value={applicationId || ""}
              onValueChange={(value) => setApplicationId(value || null)}
              options={[
                { value: "", label: "Optional" },
                ...((mode === "internal"
                  ? applicationsQuery.data?.items ?? []
                  : ownApplicationOptions
                ).map((application) => ({
                  value: application.id,
                  label: `${application.clientName} · ${application.targetCountry}`,
                })) as Array<{ value: string; label: string }>),
              ]}
            />
          </FormField>
        </div>
        <div className="mt-4">
          <FormField label="Message">
            <TextArea value={body} onChange={setBody} rows={5} />
          </FormField>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" className="btn-gold" onClick={async () => {
            try {
              if (mode === "internal") {
                await createMessageMutation.mutateAsync({ clientId, applicationId, body });
              } else {
                await createOwnMessageMutation.mutateAsync({ applicationId, body });
              }
              setBody("");
              setIsComposeOpen(false);
              toast.success("Message sent.");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to send message.");
            }
          }}>
            Send Message
          </button>
        </div>
      </FormDialog>
    </Panel>
  );
}

function PortalSummaryPanel({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: Array<{ label: string; value: string }>;
}) {
  return (
    <Panel title={title} subtitle={subtitle}>
      <DataTable
        columns={["Field", "Value"]}
        rows={data.map((item) => [item.label, item.value])}
        emptyMessage="No data available."
      />
    </Panel>
  );
}

export function ClientPortalDocumentsPage() {
  return <DocumentListPage mode="client" />;
}

export function ClientPortalAppointmentsPage() {
  return <AppointmentListPage mode="client" />;
}

export function ClientPortalPaymentsPage() {
  return <PaymentListPage mode="client" />;
}

export function ClientPortalMessagesPage() {
  return <MessageListPage mode="client" />;
}

export function AdminOrStaffDocumentsPage({ area }: { area: "admin" | "staff" }) {
  return <DocumentListPage mode="internal" area={area} />;
}

export function AdminOrStaffAppointmentsPage({ area }: { area: "admin" | "staff" }) {
  return <AppointmentListPage mode="internal" area={area} />;
}

export function AdminOrStaffPaymentsPage({ area }: { area: "admin" | "staff" }) {
  return <PaymentListPage mode="internal" area={area} />;
}

export function AdminOrStaffMessagesPage({ area }: { area: "admin" | "staff" }) {
  return <MessageListPage mode="internal" area={area} />;
}

export function ClientPortalOverviewExtras() {
  return (
    <PortalSummaryPanel
      title="Portal Features"
      subtitle="Your portal now includes document exchange, appointments, payments, and direct messaging."
      data={[
        { label: "Documents", value: "Upload required files and track verification." },
        { label: "Appointments", value: "Review upcoming consultations and meeting details." },
        { label: "Payments", value: "See pending and completed fee records." },
        { label: "Messages", value: "Message the Hadaf team directly inside the portal." },
      ]}
    />
  );
}
