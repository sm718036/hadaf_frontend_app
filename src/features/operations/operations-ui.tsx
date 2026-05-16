import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Mic, MoreVertical, Phone, Search, SendHorizontal, Video } from "lucide-react";
import { toast } from "sonner";
import { AppDialog } from "@/components/ui/app-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SelectMenu } from "@/components/ui/select-menu";
import { useCurrentClient } from "@/features/client-auth/use-client-auth";
import { useApplications, useOwnApplications } from "@/features/applications/use-applications";
import { useClients } from "@/features/clients/use-clients";
import {
  useDashboardAccess,
  useOptionalDashboardAccess,
} from "@/features/dashboard/use-dashboard-access";
import { DataTable, StatusBadge } from "@/features/dashboard/dashboard-layout";
import {
  EmptyHint,
  PaginationControls,
  Panel,
  TableToolbar,
} from "@/features/dashboard/dashboard-ui";
import { useInternalUsers } from "@/features/internal-users/use-users";
import { APP_ROUTES } from "@/config/routes";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  CHAT_CONTACT_TYPES,
  DOCUMENT_REVIEW_STATUSES,
  DOCUMENT_STATUSES,
  MEETING_STATUSES,
  MEETING_TYPES,
  OFFLINE_PAYMENT_MODES,
  PAYMENT_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type AppointmentStatus,
  type AppointmentType,
  type ChatContact,
  type ChatContactType,
  type CreateMeetingInput,
  type CreatePortalMessageInput,
  type DocumentStatus,
  type DocumentReviewStatus,
  type MeetingStatus,
  type MeetingType,
  type PaymentStatus,
  type PaymentReceiptInput,
  type PortalMeeting,
  type TaskPriority,
  type TaskStatus,
  type UpsertAppointmentInput,
  type UpsertDocumentInput,
  type UpsertPaymentInput,
  type UpsertTaskInput,
} from "./operations.schemas";
import {
  useAppointments,
  useChatContacts,
  useChatConversation,
  useChatThreads,
  useCreateMeeting,
  useCreateMessage,
  useCreateOwnDocument,
  useCreateOwnMessage,
  useDeleteAppointment,
  useDeleteDocument,
  useDeletePayment,
  useDeleteTask,
  useLogPaymentReceipt,
  useDocuments,
  useMeetingDetail,
  useMessages,
  useOpenChatThread,
  useOwnAppointments,
  useOwnMeetingDetail,
  useOwnDocuments,
  useOwnPortalConversation,
  useOwnPortalMeetings,
  useOwnMessages,
  useOwnPayments,
  usePayments,
  usePortalMeetings,
  useSendClientPortalMessage,
  useSendPortalMessage,
  useTasks,
  useUpdateMeetingStatus,
  useUpsertAppointment,
  useUpsertDocument,
  useUpsertPayment,
  useUpsertTask,
  useUploadDocumentFile,
  useUploadOwnDocumentFile,
  useUploadPaymentReceiptImage,
} from "./use-operations";
import { useFinancialLedger } from "@/features/financial-ledger/use-financial-ledger";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function formatConversationDay(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPresenceLabel(contact: ChatContact) {
  if (contact.isOnline) {
    return "Online";
  }

  if (!contact.lastActiveAt) {
    return "Offline";
  }

  return `Last active ${new Date(contact.lastActiveAt).toLocaleString()}`;
}

function PresenceBadge({ contact }: { contact: ChatContact }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
        contact.isOnline ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
      title={formatPresenceLabel(contact)}
    >
      <span
        className={`h-2 w-2 rounded-full ${contact.isOnline ? "bg-emerald-500" : "bg-slate-400"}`}
      />
      {contact.isOnline ? "Online" : "Offline"}
    </span>
  );
}

function getContactInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ContactAvatar({
  contact,
  size = "md",
}: {
  contact: ChatContact;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClassName =
    size === "sm" ? "h-10 w-10" : size === "lg" ? "h-14 w-14" : "h-12 w-12";

  return (
    <div className="relative shrink-0">
      <Avatar className={cn(sizeClassName, "border border-white/70 shadow-sm")}>
        <AvatarImage src={contact.avatarUrl || undefined} alt={contact.name} />
        <AvatarFallback className="bg-mint text-sm font-bold text-dark">
          {getContactInitials(contact.name)}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white",
          contact.isOnline ? "bg-emerald-500" : "bg-slate-300",
        )}
      />
    </div>
  );
}

function ConversationComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  pending,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  pending?: boolean;
  placeholder: string;
}) {
  return (
    <div className="border-t border-slate-200 bg-white px-5 py-4">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
        />
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-primary"
          aria-label="Voice note"
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={disabled || pending}
          onClick={onSubmit}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-dark transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Send message"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function makeSelectOptions(values: readonly string[]) {
  return values.map((value) => ({
    value,
    label: value.replaceAll("_", " "),
  }));
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
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
    checklistRuleId: null,
    title: "",
    documentType: "",
    status,
    reviewStatus: "pending",
    fileUrl: "",
    fileName: "",
    fileSize: null,
    contentType: "",
    notes: "",
    reviewNote: "",
    expiryDate: "",
    expiryAlertMonths: null,
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
    milestoneLabel: "",
    contractTotal: 0,
    dueDate: "",
    paidAt: "",
    paymentMode: null,
    paymentMethod: "",
    referenceNumber: "",
    notes: "",
    feeLines: [],
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
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      contentClassName="max-w-5xl overflow-y-auto sm:max-h-[90vh]"
    >
      {children}
    </AppDialog>
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
                <StatusBadge
                  tone={
                    task.priority === "urgent" || task.priority === "high" ? "warning" : "neutral"
                  }
                >
                  {task.priority}
                </StatusBadge>,
                <StatusBadge
                  tone={
                    task.status === "completed"
                      ? "success"
                      : task.status === "in_progress"
                        ? "info"
                        : "neutral"
                  }
                >
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
                      toast.error(
                        error instanceof Error ? error.message : "Unable to delete task.",
                      );
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
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                className={inputClassName()}
              />
            </FormField>
            <FormField label="Due Date">
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dueDate: event.target.value }))
                }
                className={inputClassName()}
              />
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
              <TextArea
                value={form.description}
                onChange={(value) => setForm((current) => ({ ...current, description: value }))}
              />
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

export function DocumentListPage({
  mode,
  area = "staff",
}: {
  mode: "internal" | "client";
  area?: "admin" | "staff";
}) {
  const access = useOptionalDashboardAccess();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [status, setStatus] = useState("");
  const [staffId, setStaffId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState<UpsertDocumentInput>(createEmptyDocumentForm("requested"));
  const staffUsersQuery = useInternalUsers({
    enabled: mode === "internal" && area === "admin",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const clientsQuery = useClients({
    enabled: mode === "internal",
    page: 1,
    pageSize: 100,
    search: "",
  });
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

  const items =
    mode === "internal" ? (documentsQuery.data?.items ?? []) : (ownDocumentsQuery.data ?? []);

  return (
    <Panel
      title={mode === "internal" ? "Documents" : "My Documents"}
      subtitle={
        mode === "internal"
          ? "Track document requests, uploads, and verification."
          : "View required documents and upload files for your case."
      }
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
          columns={[
            "Title",
            "Client",
            "Type",
            "Status",
            "Review",
            "File",
            "Visibility",
            "Uploaded",
            "Action",
          ]}
          rows={items.map((document) => [
            <div className="text-left">
              <p className="font-semibold text-slate-900">{document.title}</p>
              <p className="text-xs text-slate-500">{document.notes || "No notes"}</p>
            </div>,
            document.clientName,
            document.documentType,
            <StatusBadge
              tone={
                document.status === "verified"
                  ? "success"
                  : document.status === "rejected"
                    ? "warning"
                    : "info"
              }
            >
              {document.status}
            </StatusBadge>,
            <StatusBadge
              tone={
                document.reviewStatus === "accepted"
                  ? "success"
                  : document.reviewStatus === "rejected" || document.reviewStatus === "expired"
                    ? "warning"
                    : "info"
              }
            >
              {document.reviewStatus}
            </StatusBadge>,
            <FileLink url={document.fileUrl} label={document.fileName} />,
            document.visibleToClient ? (
              <Badge variant="success">Client visible</Badge>
            ) : (
              <Badge variant="light">Internal only</Badge>
            ),
            <div className="text-left">
              <p>{document.uploadedByClientName || document.uploadedByInternalName || "—"}</p>
              {document.isExpiryAlertDue ? (
                <p className="text-xs font-semibold text-amber-700">
                  Expiry alert due {document.expiryDate ? `· ${formatDate(document.expiryDate)}` : ""}
                </p>
              ) : document.expiryDate ? (
                <p className="text-xs text-slate-500">Expires {formatDate(document.expiryDate)}</p>
              ) : null}
            </div>,
            mode === "internal" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  onClick={() => {
                    setSelectedFile(null);
                    setForm({
                      id: document.id,
                      clientId: document.clientId,
                      applicationId: document.applicationId,
                      checklistRuleId: document.checklistRuleId,
                      title: document.title,
                      documentType: document.documentType,
                      status: document.status,
                      reviewStatus: document.reviewStatus,
                      fileUrl: document.fileUrl ?? "",
                      fileName: document.fileName ?? "",
                      fileSize: document.fileSize,
                      contentType: document.contentType ?? "",
                      notes: document.notes ?? "",
                      reviewNote: document.reviewNote ?? "",
                      expiryDate: document.expiryDate ?? "",
                      expiryAlertMonths: document.expiryAlertMonths,
                      visibleToClient: document.visibleToClient,
                    });
                    setIsCreateOpen(true);
                  }}
                >
                  Review
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive"
                  onClick={async () => {
                    try {
                      await deleteDocumentMutation.mutateAsync(document.id);
                      toast.success("Document deleted.");
                    } catch (error) {
                      toast.error(
                        error instanceof Error ? error.message : "Unable to delete document.",
                      );
                    }
                  }}
                >
                  Delete
                </button>
              </div>
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
            ? "Create, review, or request a document record without leaving the document list."
            : "Upload a document from your portal without leaving the page."
        }
      >
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {mode === "internal" ? (
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
                  ? (applicationsQuery.data?.items ?? [])
                  : ownApplicationOptions
                ).map((application) => ({
                  value: application.id,
                  label: `${application.clientName} · ${application.targetCountry}`,
                })) as Array<{ value: string; label: string }>),
              ]}
            />
          </FormField>
          <FormField label="Title">
            <input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              className={inputClassName()}
            />
          </FormField>
          <FormField label="Document Type">
            <input
              value={form.documentType}
              onChange={(event) =>
                setForm((current) => ({ ...current, documentType: event.target.value }))
              }
              className={inputClassName()}
            />
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
          {mode === "internal" ? (
            <FormField label="Review Status">
              <SelectMenu
                value={form.reviewStatus}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, reviewStatus: value as DocumentReviewStatus }))
                }
                options={makeSelectOptions(DOCUMENT_REVIEW_STATUSES)}
              />
            </FormField>
          ) : null}
          {mode === "internal" ? (
            <FormField label="Expiry Date">
              <input
                type="date"
                value={form.expiryDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, expiryDate: event.target.value }))
                }
                className={inputClassName()}
              />
            </FormField>
          ) : null}
          {mode === "internal" ? (
            <FormField label="Alert Months">
              <input
                type="number"
                min={1}
                max={24}
                value={form.expiryAlertMonths ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    expiryAlertMonths: event.target.value === "" ? null : Number(event.target.value),
                  }))
                }
                className={inputClassName()}
              />
            </FormField>
          ) : null}
          <FormField label="File">
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              className={inputClassName()}
            />
          </FormField>
        </div>
        <div className="mt-4">
          <FormField label="Notes">
            <TextArea
              value={form.notes}
              onChange={(value) => setForm((current) => ({ ...current, notes: value }))}
            />
          </FormField>
        </div>
        {mode === "internal" ? (
          <div className="mt-4">
            <FormField label="Review Notes">
              <TextArea
                value={form.reviewNote}
                onChange={(value) => setForm((current) => ({ ...current, reviewNote: value }))}
              />
            </FormField>
          </div>
        ) : null}
        {mode === "internal" ? (
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.visibleToClient}
              onChange={(event) =>
                setForm((current) => ({ ...current, visibleToClient: event.target.checked }))
              }
            />
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
                    checklistRuleId: payload.checklistRuleId,
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

export function AppointmentListPage({
  mode,
  area = "staff",
}: {
  mode: "internal" | "client";
  area?: "admin" | "staff";
}) {
  const access = useOptionalDashboardAccess();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [status, setStatus] = useState("");
  const [staffId, setStaffId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<UpsertAppointmentInput>(
    createEmptyAppointmentForm(area === "staff" ? access?.currentUser.id || null : null),
  );
  const staffUsersQuery = useInternalUsers({
    enabled: mode === "internal" && area === "admin",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const clientsQuery = useClients({
    enabled: mode === "internal",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const applicationsQuery = useApplications({
    enabled: mode === "internal",
    page: 1,
    pageSize: 100,
    search: "",
  });
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

  const staffUsers = useMemo(
    () => (staffUsersQuery.data?.items ?? []).filter((user) => user.role === "staff"),
    [staffUsersQuery.data],
  );
  useEffect(() => {
    setPage(1);
  }, [deferredSearch, status, staffId]);

  const items =
    mode === "internal" ? (appointmentsQuery.data?.items ?? []) : (ownAppointmentsQuery.data ?? []);

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
              <p className="text-xs text-slate-500">
                {appointment.location || appointment.meetingLink || "No location"}
              </p>
            </div>,
            appointment.clientName,
            appointment.appointmentType.replaceAll("_", " "),
            <StatusBadge
              tone={
                appointment.status === "completed"
                  ? "success"
                  : appointment.status === "cancelled"
                    ? "warning"
                    : "info"
              }
            >
              {appointment.status.replaceAll("_", " ")}
            </StatusBadge>,
            formatDateTime(appointment.scheduledAt),
            appointment.assignedStaffName || "Unassigned",
            mode === "internal" ? (
              <button
                type="button"
                className="rounded-xl border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive"
                onClick={async () => {
                  try {
                    await deleteAppointmentMutation.mutateAsync(appointment.id);
                    toast.success("Appointment deleted.");
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Unable to delete appointment.",
                    );
                  }
                }}
              >
                Delete
              </button>
            ) : (
              "—"
            ),
          ])}
          emptyMessage="No appointments found."
        />
      )}
      {mode === "internal" && appointmentsQuery.data ? (
        <PaginationControls
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          total={appointmentsQuery.data.total}
          totalPages={appointmentsQuery.data.totalPages}
          onPageChange={setPage}
        />
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
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                className={inputClassName()}
              />
            </FormField>
            <FormField label="Scheduled At">
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, scheduledAt: event.target.value }))
                }
                className={inputClassName()}
              />
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
              <input
                type="number"
                min="15"
                max="480"
                value={form.durationMinutes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationMinutes: Number(event.target.value) || 30,
                  }))
                }
                className={inputClassName()}
              />
            </FormField>
            <FormField label="Location">
              <input
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
                className={inputClassName()}
              />
            </FormField>
            <FormField label="Meeting Link">
              <input
                value={form.meetingLink}
                onChange={(event) =>
                  setForm((current) => ({ ...current, meetingLink: event.target.value }))
                }
                className={inputClassName()}
              />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Notes">
              <TextArea
                value={form.notes}
                onChange={(value) => setForm((current) => ({ ...current, notes: value }))}
              />
            </FormField>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="btn-gold"
              onClick={async () => {
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
                  toast.error(
                    error instanceof Error ? error.message : "Unable to save appointment.",
                  );
                }
              }}
            >
              Save Appointment
            </button>
          </div>
        </FormDialog>
      ) : null}
    </Panel>
  );
}

export function PaymentListPage({
  mode,
  area = "staff",
}: {
  mode: "internal" | "client";
  area?: "admin" | "staff";
}) {
  const access = useOptionalDashboardAccess();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [status, setStatus] = useState("");
  const [staffId, setStaffId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedReceiptFile, setSelectedReceiptFile] = useState<File | null>(null);
  const [form, setForm] = useState<UpsertPaymentInput>(createEmptyPaymentForm());
  const [receiptForm, setReceiptForm] = useState<PaymentReceiptInput>({
    paymentId: "",
    amount: 0,
    paymentMode: "cash",
    receiptUrl: "",
    receiptFileName: "",
    receiptContentType: "",
    receivedAt: "",
    notes: "",
  });
  const staffUsersQuery = useInternalUsers({
    enabled: mode === "internal" && area === "admin",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const clientsQuery = useClients({
    enabled: mode === "internal",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const applicationsQuery = useApplications({
    enabled: mode === "internal",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const paymentsQuery = usePayments({
    enabled: mode === "internal" && !!access?.canReadPayments,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search: deferredSearch,
    status,
    staffId,
  });
  const ownPaymentsQuery = useOwnPayments(mode === "client");
  const ledgerQuery = useFinancialLedger(mode === "internal" && area === "admin");
  const upsertPaymentMutation = useUpsertPayment();
  const logPaymentReceiptMutation = useLogPaymentReceipt();
  const deletePaymentMutation = useDeletePayment();
  const uploadPaymentReceiptImageMutation = useUploadPaymentReceiptImage();
  const staffUsers = useMemo(
    () => (staffUsersQuery.data?.items ?? []).filter((user) => user.role === "staff"),
    [staffUsersQuery.data],
  );
  useEffect(() => {
    setPage(1);
  }, [deferredSearch, status, staffId]);
  const items =
    mode === "internal" ? (paymentsQuery.data?.items ?? []) : (ownPaymentsQuery.data ?? []);

  return (
    <Panel
      title={mode === "internal" ? "Payments" : "My Payments"}
      subtitle="Track milestone invoices, offline receipts, and live balance due for each client case."
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
        <InternalFilters
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          status={status}
          setStatus={setStatus}
          staffId={staffId}
          setStaffId={setStaffId}
          staffUsers={staffUsers.map((user) => ({ id: user.id, name: user.name }))}
          summary={`${paymentsQuery.data?.total ?? 0} matching payments`}
        />
      ) : null}
      {(mode === "internal" ? paymentsQuery.isLoading : ownPaymentsQuery.isLoading) ? (
        <EmptyHint message="Loading payments..." loading />
      ) : (
        <DataTable
          columns={["Title", "Client", "Amount", "Status", "Due", "Paid", "Action"]}
          rows={items.map((payment) => [
            <div className="text-left">
              <p className="font-semibold text-slate-900">{payment.title}</p>
              <p className="text-xs text-slate-500">
                {[payment.milestoneLabel, payment.notes].filter(Boolean).join(" · ") || "No notes"}
              </p>
            </div>,
            payment.clientName,
            <div className="text-left">
              <p>{`${payment.currency} ${payment.amount.toLocaleString()}`}</p>
              <p className="text-xs text-slate-500">
                Received {payment.amountReceived.toLocaleString()} · Due {payment.balanceDue.toLocaleString()}
              </p>
            </div>,
            <StatusBadge
              tone={
                payment.status === "paid"
                  ? "success"
                  : payment.status === "overdue"
                    ? "warning"
                    : "info"
              }
            >
              {payment.status}
            </StatusBadge>,
            formatDate(payment.dueDate),
            <div className="text-left">
              <p>{formatDateTime(payment.paidAt)}</p>
              <p className="text-xs text-slate-500">{payment.paymentMode || "No manual mode logged"}</p>
            </div>,
            mode === "internal" ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  onClick={() => {
                    setReceiptForm({
                      paymentId: payment.id,
                      amount: payment.balanceDue > 0 ? payment.balanceDue : payment.amount,
                      paymentMode: payment.paymentMode ?? "cash",
                      receiptUrl: "",
                      receiptFileName: "",
                      receiptContentType: "",
                      receivedAt: new Date().toISOString().slice(0, 16),
                      notes: "",
                    });
                    setSelectedReceiptFile(null);
                    setIsReceiptOpen(true);
                  }}
                >
                  Log Receipt
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive"
                  onClick={async () => {
                    try {
                      await deletePaymentMutation.mutateAsync(payment.id);
                      toast.success("Payment deleted.");
                    } catch (error) {
                      toast.error(
                        error instanceof Error ? error.message : "Unable to delete payment.",
                      );
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            ) : (
              "—"
            ),
          ])}
          emptyMessage="No payments found."
        />
      )}
      {mode === "internal" && paymentsQuery.data ? (
        <PaginationControls
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          total={paymentsQuery.data.total}
          totalPages={paymentsQuery.data.totalPages}
          onPageChange={setPage}
        />
      ) : null}
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
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                className={inputClassName()}
              />
            </FormField>
            <FormField label="Amount">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, amount: Number(event.target.value) || 0 }))
                }
                className={inputClassName()}
              />
            </FormField>
            <FormField label="Milestone Label">
              <input
                value={form.milestoneLabel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, milestoneLabel: event.target.value }))
                }
                className={inputClassName()}
              />
            </FormField>
            <FormField label="Contract Total">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.contractTotal}
                onChange={(event) =>
                  setForm((current) => ({ ...current, contractTotal: Number(event.target.value) || 0 }))
                }
                className={inputClassName()}
              />
            </FormField>
            <FormField label="Currency">
              <input
                value={form.currency}
                onChange={(event) =>
                  setForm((current) => ({ ...current, currency: event.target.value }))
                }
                className={inputClassName()}
              />
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
            <FormField label="Manual Payment Mode">
              <SelectMenu
                value={form.paymentMode || ""}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, paymentMode: (value || null) as UpsertPaymentInput["paymentMode"] }))
                }
                options={[
                  { value: "", label: "Not set" },
                  ...makeSelectOptions(OFFLINE_PAYMENT_MODES),
                ]}
              />
            </FormField>
            <FormField label="Due Date">
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dueDate: event.target.value }))
                }
                className={inputClassName()}
              />
            </FormField>
            <FormField label="Paid At">
              <input
                type="datetime-local"
                value={form.paidAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, paidAt: event.target.value }))
                }
                className={inputClassName()}
              />
            </FormField>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FormField label="Payment Method">
              <input
                value={form.paymentMethod}
                onChange={(event) =>
                  setForm((current) => ({ ...current, paymentMethod: event.target.value }))
                }
                className={inputClassName()}
              />
            </FormField>
            <FormField label="Reference Number">
              <input
                value={form.referenceNumber}
                onChange={(event) =>
                  setForm((current) => ({ ...current, referenceNumber: event.target.value }))
                }
                className={inputClassName()}
              />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Notes">
              <TextArea
                value={form.notes}
                onChange={(value) => setForm((current) => ({ ...current, notes: value }))}
              />
            </FormField>
          </div>
          <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Fee Lines</p>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    feeLines: [
                      ...current.feeLines,
                      {
                        feeItemId: null,
                        label: "",
                        amount: 0,
                        currency: current.currency,
                        displayOrder: current.feeLines.length,
                      },
                    ],
                  }))
                }
              >
                Add Fee Line
              </button>
            </div>
            <div className="space-y-3">
              {form.feeLines.map((line, index) => (
                <div key={line.id ?? index} className="grid gap-3 md:grid-cols-4">
                  <SelectMenu
                    value={line.feeItemId || ""}
                    onValueChange={(value) => {
                      const selected = (ledgerQuery.data?.feeItems ?? []).find((item) => item.id === value);
                      setForm((current) => ({
                        ...current,
                        feeLines: current.feeLines.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                feeItemId: value || null,
                                label: selected?.label ?? item.label,
                                amount: selected?.defaultAmount ?? item.amount,
                                currency: selected?.currency ?? item.currency,
                              }
                            : item,
                        ),
                      }));
                    }}
                    options={[
                      { value: "", label: "Custom line" },
                      ...((ledgerQuery.data?.feeItems ?? []).map((item) => ({
                        value: item.id,
                        label: `${item.code} · ${item.label}`,
                      })) as Array<{ value: string; label: string }>),
                    ]}
                  />
                  <input
                    value={line.label}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        feeLines: current.feeLines.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, label: event.target.value } : item,
                        ),
                      }))
                    }
                    className={inputClassName()}
                    placeholder="Fee label"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        feeLines: current.feeLines.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, amount: Number(event.target.value) || 0 } : item,
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                  <input
                    value={line.currency}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        feeLines: current.feeLines.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, currency: event.target.value.toUpperCase() } : item,
                        ),
                      }))
                    }
                    className={inputClassName()}
                    placeholder="Currency"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="btn-gold"
              onClick={async () => {
                try {
                  await upsertPaymentMutation.mutateAsync(form);
                  toast.success("Payment saved.");
                  setForm(createEmptyPaymentForm());
                  setIsCreateOpen(false);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to save payment.");
                }
              }}
            >
              Save Payment
            </button>
          </div>
        </FormDialog>
      ) : null}

      {mode === "internal" ? (
        <FormDialog
          open={isReceiptOpen}
          onOpenChange={setIsReceiptOpen}
          title="Log Offline Payment"
          description="Attach a cash, wire, or POS receipt and reconcile the outstanding balance immediately."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Amount Received">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={receiptForm.amount}
                onChange={(event) =>
                  setReceiptForm((current) => ({ ...current, amount: Number(event.target.value) || 0 }))
                }
                className={inputClassName()}
              />
            </FormField>
            <FormField label="Manual Mode">
              <SelectMenu
                value={receiptForm.paymentMode}
                onValueChange={(value) =>
                  setReceiptForm((current) => ({ ...current, paymentMode: value as PaymentReceiptInput["paymentMode"] }))
                }
                options={makeSelectOptions(OFFLINE_PAYMENT_MODES)}
              />
            </FormField>
            <FormField label="Received At">
              <input
                type="datetime-local"
                value={receiptForm.receivedAt}
                onChange={(event) =>
                  setReceiptForm((current) => ({ ...current, receivedAt: event.target.value }))
                }
                className={inputClassName()}
              />
            </FormField>
            <FormField label="Receipt Screenshot">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setSelectedReceiptFile(event.target.files?.[0] ?? null)}
                className={inputClassName()}
              />
            </FormField>
          </div>
          <div className="mt-4">
            <FormField label="Notes">
              <TextArea
                value={receiptForm.notes}
                onChange={(value) => setReceiptForm((current) => ({ ...current, notes: value }))}
              />
            </FormField>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="btn-gold"
              onClick={async () => {
                try {
                  let upload = null;

                  if (selectedReceiptFile) {
                    upload = await uploadPaymentReceiptImageMutation.mutateAsync(selectedReceiptFile);
                  }

                  await logPaymentReceiptMutation.mutateAsync({
                    ...receiptForm,
                    receiptUrl: upload?.src || receiptForm.receiptUrl,
                    receiptFileName: upload?.fileName || receiptForm.receiptFileName,
                    receiptContentType: upload?.contentType || receiptForm.receiptContentType,
                  });
                  toast.success("Receipt logged.");
                  setSelectedReceiptFile(null);
                  setIsReceiptOpen(false);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to log receipt.");
                }
              }}
            >
              Log Receipt
            </button>
          </div>
        </FormDialog>
      ) : null}
    </Panel>
  );
}

function contactKey(contact: ChatContact | null) {
  return contact ? `${contact.type}:${contact.id}` : "";
}

function MeetingCard({
  meeting,
  area,
  onMarkCompleted,
  onCancel,
  canManage,
}: {
  meeting: PortalMeeting;
  area: "admin" | "staff" | "client";
  onMarkCompleted?: (meetingId: string) => void;
  onCancel?: (meetingId: string) => void;
  canManage: boolean;
}) {
  const statusTone =
    meeting.status === "completed"
      ? "success"
      : meeting.status === "cancelled"
        ? "warning"
        : "info";

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/92 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-slate-950">{meeting.title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {meeting.contact.name} · {formatDateTime(meeting.scheduledAt)}
          </p>
        </div>
        <StatusBadge tone={statusTone}>{meeting.status.replaceAll("_", " ")}</StatusBadge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        <span>{meeting.meetingType.replaceAll("_", " ")}</span>
        <span>{meeting.durationMinutes} min</span>
      </div>
      {meeting.notes ? (
        <p className="mt-3 text-sm leading-6 text-slate-600">{meeting.notes}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={meeting.joinPath} className="btn-gold !px-4 !py-2.5 text-xs">
          {meeting.meetingType === "video_call" ? "Join Video Call" : "Open Meeting"}
        </Link>
        {canManage && meeting.status === "scheduled" ? (
          <>
            <button
              type="button"
              className="btn-secondary !px-4 !py-2.5 text-xs"
              onClick={() => onMarkCompleted?.(meeting.id)}
            >
              Mark Completed
            </button>
            <button
              type="button"
              className="btn-secondary !px-4 !py-2.5 text-xs"
              onClick={() => onCancel?.(meeting.id)}
            >
              Cancel
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function MessageListPage({
  mode,
  area = "staff",
}: {
  mode: "internal" | "client";
  area?: "admin" | "staff";
}) {
  const access = useOptionalDashboardAccess();
  const canReadMessages = mode === "client" || Boolean(access?.canReadMessages);
  const canWriteMessages = mode === "client" || Boolean(access?.canWriteMessages);
  const [threadSearch, setThreadSearch] = useState("");
  const deferredThreadSearch = useDeferredValue(threadSearch.trim());
  const [contactSearch, setContactSearch] = useState("");
  const deferredContactSearch = useDeferredValue(contactSearch.trim());
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [composerBody, setComposerBody] = useState("");
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState<{
    title: string;
    notes: string;
    scheduledAt: string;
    durationMinutes: number;
    meetingType: MeetingType;
  }>({
    title: "",
    notes: "",
    scheduledAt: "",
    durationMinutes: 30,
    meetingType: "video_call",
  });

  const threadsQuery = useChatThreads(deferredThreadSearch, mode === "internal" && canReadMessages);
  const contactsQuery = useChatContacts(
    deferredContactSearch,
    mode === "internal" && canReadMessages && isContactDialogOpen,
  );
  const conversationQuery = useChatConversation(
    selectedThreadId,
    mode === "internal" && canReadMessages && Boolean(selectedThreadId),
  );
  const ownConversationQuery = useOwnPortalConversation(mode === "client");
  const meetingsQuery = usePortalMeetings(mode === "internal" && canReadMessages);
  const ownMeetingsQuery = useOwnPortalMeetings(mode === "client");
  const openChatThreadMutation = useOpenChatThread();
  const sendPortalMessageMutation = useSendPortalMessage();
  const sendClientPortalMessageMutation = useSendClientPortalMessage();
  const createMeetingMutation = useCreateMeeting();
  const updateMeetingStatusMutation = useUpdateMeetingStatus();

  useEffect(() => {
    if (mode !== "internal") {
      return;
    }

    const firstThreadId = threadsQuery.data?.[0]?.threadId ?? "";

    if (!selectedThreadId && firstThreadId) {
      setSelectedThreadId(firstThreadId);
    } else if (
      selectedThreadId &&
      !(threadsQuery.data ?? []).some((thread) => thread.threadId === selectedThreadId)
    ) {
      setSelectedThreadId(firstThreadId);
    }
  }, [mode, selectedThreadId, threadsQuery.data]);

  const selectedThreadSummary = useMemo(
    () => (threadsQuery.data ?? []).find((thread) => thread.threadId === selectedThreadId) ?? null,
    [selectedThreadId, threadsQuery.data],
  );
  const selectedContact =
    mode === "internal"
      ? (conversationQuery.data?.contact ?? selectedThreadSummary?.contact ?? null)
      : (ownConversationQuery.data?.contact ?? null);
  const conversationMessages =
    mode === "internal"
      ? (conversationQuery.data?.messages ?? [])
      : (ownConversationQuery.data?.messages ?? []);
  const meetings = mode === "internal" ? (meetingsQuery.data ?? []) : (ownMeetingsQuery.data ?? []);
  const filteredMeetings = selectedContact
    ? meetings.filter((meeting) => contactKey(meeting.contact) === contactKey(selectedContact))
    : meetings;
  const sidebarMeetings = mode === "internal" ? filteredMeetings : meetings;
  const composerPending =
    mode === "internal"
      ? sendPortalMessageMutation.isPending
      : sendClientPortalMessageMutation.isPending;
  const showConversationLoading =
    mode === "internal"
      ? conversationQuery.isLoading && Boolean(selectedThreadId)
      : ownConversationQuery.isLoading;
  const conversationErrorMessage =
    mode === "client" && ownConversationQuery.error
      ? ownConversationQuery.error instanceof Error
        ? ownConversationQuery.error.message
        : "Unable to load your conversation."
      : null;

  const submitMessage = async () => {
    if (!composerBody.trim()) {
      toast.error("Message body is required.");
      return;
    }

    try {
      if (mode === "internal") {
        if (!selectedContact) {
          toast.error("Select a conversation first.");
          return;
        }

        const conversation = await sendPortalMessageMutation.mutateAsync({
          contactType: selectedContact.type,
          contactId: selectedContact.id,
          body: composerBody,
        });
        setSelectedThreadId(conversation.threadId);
      } else {
        await sendClientPortalMessageMutation.mutateAsync({ body: composerBody });
      }

      setComposerBody("");
      toast.success("Message sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send message.");
    }
  };

  const submitMeeting = async () => {
    if (!selectedContact) {
      toast.error("Select a conversation first.");
      return;
    }

    try {
      await createMeetingMutation.mutateAsync({
        contactType: selectedContact.type,
        contactId: selectedContact.id,
        title: meetingForm.title,
        notes: meetingForm.notes,
        scheduledAt: meetingForm.scheduledAt,
        durationMinutes: meetingForm.durationMinutes,
        meetingType: meetingForm.meetingType,
      });
      toast.success("Meeting scheduled.");
      setMeetingForm({
        title: "",
        notes: "",
        scheduledAt: "",
        durationMinutes: 30,
        meetingType: "video_call",
      });
      setIsMeetingDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to schedule meeting.");
    }
  };

  return (
    <>
      <Panel
        title="Messages & Meetings"
        subtitle={
          mode === "internal"
            ? "Work through client and team conversations in one shared workspace."
            : "Stay connected with your assigned Hadaf contact in one conversation hub."
        }
        className="overflow-hidden border-brand-line bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(164,255,238,0.12)_100%)] p-0"
        action={
          mode === "internal" ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsContactDialogOpen(true)}
              >
                New Conversation
              </button>
              <button
                type="button"
                className="btn-gold"
                onClick={() => setIsMeetingDialogOpen(true)}
                disabled={!selectedContact || !canWriteMessages}
              >
                Schedule Meeting
              </button>
            </div>
          ) : null
        }
      >
{!canReadMessages ? (
          <EmptyHint message="You do not have permission to access the messaging workspace." />
        ) : (
          <div className="grid min-h-[78vh] gap-0 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="flex min-h-[78vh] flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(164,255,238,0.1)_100%)]">
              {showConversationLoading ? (
                <div className="flex min-h-[78vh] items-center justify-center px-6">
                  <EmptyHint message="Loading conversation..." loading />
                </div>
              ) : conversationErrorMessage ? (
                <div className="flex min-h-[78vh] items-center justify-center px-6">
                  <EmptyHint message={conversationErrorMessage} tone="error" />
                </div>
              ) : selectedContact ? (
                <>
                  <div className="border-b border-slate-200/80 bg-white/88 px-5 py-4 backdrop-blur sm:px-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <ContactAvatar contact={selectedContact} size="lg" />
                        <div className="min-w-0">
                          <h3 className="truncate font-display text-xl font-extrabold text-slate-950 sm:text-2xl">
                            {selectedContact.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-3">
                            <p className="truncate text-sm text-slate-500">
                              {selectedContact.roleLabel}
                              {selectedContact.email ? ` · ${selectedContact.email}` : ""}
                            </p>
                            <PresenceBadge contact={selectedContact} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <button
                          type="button"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 transition hover:bg-brand-soft hover:text-dark"
                          aria-label="Call contact"
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 transition hover:bg-brand-soft hover:text-dark"
                          aria-label="Video call contact"
                        >
                          <Video className="h-4 w-4" />
                        </button>
                        {mode === "internal" ? (
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 transition hover:bg-brand-soft hover:text-dark"
                            aria-label="Conversation options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="scrollbar-subtle flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    {conversationMessages.length === 0 ? (
                      <EmptyHint
                        message={
                          mode === "internal"
                            ? "No messages in this conversation yet."
                            : "No messages yet. Start the conversation below."
                        }
                      />
                    ) : (
                      <div className="space-y-6">
                        {conversationMessages.map((message, index) => {
                          const previousMessage = conversationMessages[index - 1] ?? null;
                          const currentDay = new Date(message.createdAt).toDateString();
                          const previousDay = previousMessage
                            ? new Date(previousMessage.createdAt).toDateString()
                            : null;
                          const showsDayDivider = currentDay !== previousDay;
                          const alignsRight =
                            mode === "internal"
                              ? message.senderType === "internal" &&
                                message.senderAppUserId !== null
                              : message.senderType === "client";

                          return (
                            <div key={message.id}>
                              {showsDayDivider ? (
                                <div className="mb-5 flex items-center justify-center">
                                  <span className="rounded-full bg-white/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 shadow-sm ring-1 ring-slate-200/70">
                                    {formatConversationDay(message.createdAt)}
                                  </span>
                                </div>
                              ) : null}
                              <div
                                className={cn(
                                  "flex gap-3",
                                  alignsRight ? "justify-end" : "justify-start",
                                )}
                              >
                                {!alignsRight ? (
                                  <ContactAvatar contact={selectedContact} size="sm" />
                                ) : null}
                                <div className="max-w-[85%] sm:max-w-[72%]">
                                  <div
                                    className={cn(
                                      "rounded-[1.55rem] px-4 py-3 text-sm leading-6 shadow-sm sm:px-5",
                                      alignsRight
                                        ? "rounded-br-md bg-brand-ink text-white"
                                        : "rounded-bl-md border border-slate-200/80 bg-white text-slate-700",
                                    )}
                                  >
                                    <p className="font-semibold">{message.senderName}</p>
                                    <p className="mt-1 whitespace-pre-wrap">{message.body}</p>
                                  </div>
                                  <div
                                    className={cn(
                                      "mt-1 px-2 text-[11px] text-slate-400",
                                      alignsRight ? "text-right" : "text-left",
                                    )}
                                  >
                                    {formatDateTime(message.createdAt)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <ConversationComposer
                    value={composerBody}
                    onChange={setComposerBody}
                    onSubmit={submitMessage}
                    disabled={!canWriteMessages}
                    pending={composerPending}
                    placeholder="Type a message"
                  />
                </>
              ) : (
                <div className="flex min-h-[78vh] items-center justify-center px-6">
                  <EmptyHint
                    message={
                      mode === "internal"
                        ? "Select a conversation to begin messaging."
                        : "Your staff contact will appear here once the conversation is ready."
                    }
                  />
                </div>
              )}
            </section>

            <aside className="border-t border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(164,255,238,0.24)_100%)] xl:border-l xl:border-t-0">
              <div className="flex h-full flex-col">
                <div className="border-b border-slate-200/80 px-4 py-4 sm:px-5">
                  {mode === "internal" ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-extrabold text-slate-950">
                            Chats
                          </p>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            {threadsQuery.data?.length ?? 0} conversations
                          </p>
                        </div>
                        <button
                          type="button"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-dark transition hover:brightness-95"
                          onClick={() => setIsContactDialogOpen(true)}
                          aria-label="New conversation"
                        >
                          +
                        </button>
                      </div>
                      <div className="mt-4 flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                          value={threadSearch}
                          onChange={(event) => setThreadSearch(event.target.value)}
                          placeholder="Search conversations"
                          className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-display text-lg font-extrabold text-slate-950">
                        Conversation Info
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Your Hadaf contact and upcoming consultations live here.
                      </p>
                    </>
                  )}
                </div>

                {mode === "internal" ? (
                  <div className="scrollbar-subtle max-h-[42vh] flex-1 overflow-y-auto px-3 py-3">
                    {threadsQuery.isLoading ? (
                      <EmptyHint message="Loading conversations..." loading />
                    ) : (threadsQuery.data ?? []).length === 0 ? (
                      <EmptyHint message="No conversations available yet." />
                    ) : (
                      (threadsQuery.data ?? []).map((thread) => (
                        <button
                          key={thread.threadId}
                          type="button"
                          onClick={() => setSelectedThreadId(thread.threadId)}
                          className={cn(
                            "mb-2 flex w-full items-center gap-3 rounded-[1.5rem] px-3 py-3 text-left transition",
                            thread.threadId === selectedThreadId
                              ? "bg-white shadow-sm ring-1 ring-primary/35"
                              : "hover:bg-white/80",
                          )}
                        >
                          <ContactAvatar contact={thread.contact} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                  {thread.contact.name}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                  {thread.lastMessagePreview || "No messages yet."}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-[11px] text-slate-400">
                                  {formatDateTime(thread.lastMessageAt)}
                                </p>
                                {thread.unreadCount > 0 ? (
                                  <span className="mt-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-dark">
                                    {thread.unreadCount}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <div className="mt-2 text-[11px] text-slate-400">
                              {formatPresenceLabel(thread.contact)}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                ) : selectedContact ? (
                  <div className="px-4 py-4 sm:px-5">
                    <div className="rounded-[1.75rem] border border-white/70 bg-white/88 p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <ContactAvatar contact={selectedContact} size="md" />
                        <div className="min-w-0">
                          <p className="truncate font-display text-lg font-extrabold text-slate-950">
                            {selectedContact.name}
                          </p>
                          <p className="truncate text-sm text-slate-500">
                            {selectedContact.roleLabel}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <PresenceBadge contact={selectedContact} />
                        {selectedContact.email ? (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                            {selectedContact.email}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="border-t border-slate-200/80 px-4 py-4 sm:px-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-extrabold text-slate-950">
                        Meetings
                      </p>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        {mode === "internal" ? "Active thread schedule" : "Upcoming consultations"}
                      </p>
                    </div>
                    {mode === "internal" ? (
                      <button
                        type="button"
                        className="text-xs font-semibold text-primary disabled:text-slate-400"
                        onClick={() => setIsMeetingDialogOpen(true)}
                        disabled={!selectedContact || !canWriteMessages}
                      >
                        Schedule
                      </button>
                    ) : null}
                  </div>
                  <div className="scrollbar-subtle max-h-[30vh] space-y-3 overflow-y-auto pr-1">
                    {(mode === "internal" ? meetingsQuery.isLoading : ownMeetingsQuery.isLoading) ? (
                      <EmptyHint message="Loading meetings..." loading />
                    ) : sidebarMeetings.length === 0 ? (
                      <EmptyHint
                        message={
                          mode === "internal"
                            ? "No meetings scheduled for this conversation yet."
                            : "No meetings scheduled yet."
                        }
                      />
                    ) : (
                      sidebarMeetings.map((meeting) => (
                        <MeetingCard
                          key={meeting.id}
                          meeting={meeting}
                          area={mode === "internal" ? area : "client"}
                          canManage={mode === "internal" && canWriteMessages}
                          onMarkCompleted={
                            mode === "internal"
                              ? (meetingId) =>
                                  updateMeetingStatusMutation.mutate(
                                    { meetingId, input: { status: "completed" } },
                                    {
                                      onSuccess: () =>
                                        toast.success("Meeting marked completed."),
                                      onError: (error) =>
                                        toast.error(
                                          error instanceof Error
                                            ? error.message
                                            : "Unable to update meeting.",
                                        ),
                                    },
                                  )
                              : undefined
                          }
                          onCancel={
                            mode === "internal"
                              ? (meetingId) =>
                                  updateMeetingStatusMutation.mutate(
                                    { meetingId, input: { status: "cancelled" } },
                                    {
                                      onSuccess: () => toast.success("Meeting cancelled."),
                                      onError: (error) =>
                                        toast.error(
                                          error instanceof Error
                                            ? error.message
                                            : "Unable to update meeting.",
                                        ),
                                    },
                                  )
                              : undefined
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </Panel>

      <FormDialog
        open={isContactDialogOpen}
        onOpenChange={setIsContactDialogOpen}
        title="Start a Conversation"
        description="Select an internal account or client contact. Client portal users only see the single assigned contact thread."
      >
        <TableToolbar
          searchValue={contactSearch}
          onSearchChange={setContactSearch}
          searchPlaceholder="Search staff, admins, or clients..."
          summary={`${contactsQuery.data?.length ?? 0} contacts`}
        />
        <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto">
          {contactsQuery.isLoading ? (
            <EmptyHint message="Loading contacts..." loading />
          ) : (
            (contactsQuery.data ?? []).map((contact) => (
              <button
                key={contactKey(contact)}
                type="button"
                onClick={async () => {
                  try {
                    const conversation = await openChatThreadMutation.mutateAsync({
                      contactType: contact.type,
                      contactId: contact.id,
                    });
                    setSelectedThreadId(conversation.threadId);
                    setIsContactDialogOpen(false);
                    toast.success("Conversation ready.");
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Unable to open conversation.",
                    );
                  }
                }}
                className="w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-left hover:bg-white"
              >
                <p className="font-semibold text-slate-900">{contact.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                  {contact.roleLabel}
                </p>
                <div className="mt-2">
                  <PresenceBadge contact={contact} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {contact.subtitle || contact.email || "Contact account"}
                </p>
              </button>
            ))
          )}
        </div>
      </FormDialog>

      <FormDialog
        open={isMeetingDialogOpen}
        onOpenChange={setIsMeetingDialogOpen}
        title="Schedule Meeting"
        description="Create a scheduled consultation or video call tied to the current conversation."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Contact">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {selectedContact
                ? `${selectedContact.name} · ${selectedContact.roleLabel}`
                : "Select a conversation first"}
            </div>
          </FormField>
          <FormField label="Meeting Type">
            <SelectMenu
              value={meetingForm.meetingType}
              onValueChange={(value) =>
                setMeetingForm((current) => ({ ...current, meetingType: value as MeetingType }))
              }
              options={makeSelectOptions(MEETING_TYPES)}
            />
          </FormField>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormField label="Title">
            <input
              value={meetingForm.title}
              onChange={(event) =>
                setMeetingForm((current) => ({ ...current, title: event.target.value }))
              }
              className={inputClassName()}
            />
          </FormField>
          <FormField label="Scheduled At">
            <input
              type="datetime-local"
              value={meetingForm.scheduledAt}
              onChange={(event) =>
                setMeetingForm((current) => ({ ...current, scheduledAt: event.target.value }))
              }
              className={inputClassName()}
            />
          </FormField>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormField label="Duration">
            <input
              type="number"
              min="15"
              max="480"
              value={meetingForm.durationMinutes}
              onChange={(event) =>
                setMeetingForm((current) => ({
                  ...current,
                  durationMinutes: Number(event.target.value) || 30,
                }))
              }
              className={inputClassName()}
            />
          </FormField>
          <FormField label="Notes">
            <TextArea
              value={meetingForm.notes}
              onChange={(value) => setMeetingForm((current) => ({ ...current, notes: value }))}
              rows={3}
            />
          </FormField>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" className="btn-gold" onClick={submitMeeting}>
            Schedule Meeting
          </button>
        </div>
      </FormDialog>
    </>
  );
}

export function MeetingRoomPage({
  mode,
  area = "staff",
}: {
  mode: "internal" | "client";
  area?: "admin" | "staff";
}) {
  const { meetingId = "" } = useParams();
  const navigate = useNavigate();
  const internalMeetingQuery = useMeetingDetail(
    meetingId,
    mode === "internal" && Boolean(meetingId),
  );
  const ownMeetingQuery = useOwnMeetingDetail(meetingId, mode === "client" && Boolean(meetingId));
  const meetingQuery = mode === "internal" ? internalMeetingQuery : ownMeetingQuery;

  if (meetingQuery.isLoading) {
    return <EmptyHint message="Loading meeting..." loading />;
  }

  if (meetingQuery.error || !meetingQuery.data) {
    return (
      <Panel title="Meeting" subtitle="Meeting details could not be loaded.">
        <EmptyHint
          message={
            meetingQuery.error instanceof Error ? meetingQuery.error.message : "Meeting not found."
          }
        />
      </Panel>
    );
  }

  const meeting = meetingQuery.data;
  const backPath =
    mode === "client"
      ? APP_ROUTES.dashboardClientMessages
      : area === "admin"
        ? APP_ROUTES.dashboardAdminMessages
        : APP_ROUTES.dashboardStaffMessages;

  return (
    <Panel
      title={meeting.title}
      subtitle={`${meeting.contact.name} · ${formatDateTime(meeting.scheduledAt)} · ${meeting.meetingType.replaceAll("_", " ")}`}
      action={
        <button type="button" className="btn-secondary" onClick={() => navigate(backPath)}>
          Back to Messages
        </button>
      }
    >
      <div className="space-y-5">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <span>{meeting.durationMinutes} minutes</span>
            <span>{meeting.status.replaceAll("_", " ")}</span>
            <span>Room: {meeting.roomName}</span>
          </div>
          {meeting.notes ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">{meeting.notes}</p>
          ) : null}
        </div>
        {meeting.meetingType === "video_call" ? (
          <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-950">
            <iframe
              title={meeting.title}
              src={`https://meet.jit.si/${encodeURIComponent(meeting.roomName)}#config.prejoinPageEnabled=false`}
              className="h-[72vh] w-full"
              allow="camera; microphone; display-capture; fullscreen"
            />
          </div>
        ) : (
          <div className="rounded-[1.8rem] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm leading-6 text-slate-600">
              This meeting is configured as {meeting.meetingType.replaceAll("_", " ")}. Use the
              thread to confirm logistics with {meeting.contact.name}.
            </p>
          </div>
        )}
      </div>
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
