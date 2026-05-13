import { Link } from "react-router-dom";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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
import { useCurrentUser } from "@/features/auth/use-auth";
import { useDashboardAccess } from "@/features/dashboard/dashboard-context";
import { DataTable, StatusBadge } from "@/features/dashboard/dashboard-layout";
import {
  EmptyHint,
  LoadingOverlay,
  PaginationControls,
  Panel,
  TableToolbar,
} from "@/features/dashboard/dashboard-ui";
import { Skeleton } from "@/components/ui/skeleton";
import type { Lead, LeadStatus, LeadSource, UpsertLeadInput } from "@/features/leads/leads.schemas";
import {
  useConvertLead,
  useDeleteLead,
  useLead,
  useLeads,
  useUpsertLead,
} from "@/features/leads/use-leads";
import { useInternalUsers } from "@/features/internal-users/use-users";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { buildPath, useAppNavigate } from "@/lib/router";

const LEAD_STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "converted", "lost"];
const LEAD_SOURCE_OPTIONS: LeadSource[] = [
  "website",
  "whatsapp",
  "referral",
  "social_media",
  "walk_in",
  "other",
];

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function formatDateForInput(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function getStatusTone(status: LeadStatus): "info" | "warning" | "success" | "neutral" {
  if (status === "new") return "info";
  if (status === "contacted") return "warning";
  if (status === "qualified" || status === "converted") return "success";
  return "neutral";
}

function buildEmptyLeadForm(): UpsertLeadInput {
  return {
    fullName: "",
    phone: "",
    email: "",
    interestedCountry: "",
    interestedService: "",
    message: "",
    source: "website",
    status: "new",
    assignedStaffUserId: null,
    nextFollowUpDate: "",
    internalNotes: "",
    allowDuplicate: false,
  };
}

function mapLeadToForm(lead: Lead): UpsertLeadInput {
  return {
    id: lead.id,
    fullName: lead.fullName,
    phone: lead.phone ?? "",
    email: lead.email ?? "",
    interestedCountry: lead.interestedCountry ?? "",
    interestedService: lead.interestedService ?? "",
    message: lead.message ?? "",
    source: lead.source,
    status: lead.status,
    assignedStaffUserId: lead.assignedStaffUserId,
    nextFollowUpDate: formatDateForInput(lead.nextFollowUpDate),
    internalNotes: lead.internalNotes ?? "",
    allowDuplicate: false,
  };
}

async function submitLeadWithDuplicateOverride(
  mutation: ReturnType<typeof useUpsertLead>,
  input: UpsertLeadInput,
  confirmDuplicate: (message: string) => Promise<boolean>,
) {
  try {
    return await mutation.mutateAsync(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the lead.";

    if (message.startsWith("Potential duplicate lead found")) {
      if (!(await confirmDuplicate(message))) {
        throw error;
      }

      return mutation.mutateAsync({ ...input, allowDuplicate: true });
    }

    throw error;
  }
}

export function LeadListPage({ area }: { area: "admin" | "staff" }) {
  const navigate = useAppNavigate();
  const dialogs = useAppDialogs();
  const access = useDashboardAccess();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [status, setStatus] = useState("");
  const [country, setCountry] = useState("");
  const [service, setService] = useState("");
  const [staffId, setStaffId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<UpsertLeadInput>(buildEmptyLeadForm());
  const leadsQuery = useLeads({
    enabled: access.canReadLeads,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search: deferredSearch,
    status,
    country,
    service,
    staffId,
    dateFrom,
    dateTo,
  });
  const upsertLeadMutation = useUpsertLead();
  const deleteLeadMutation = useDeleteLead();
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
  }, [deferredSearch, status, country, service, staffId, dateFrom, dateTo]);

  const leads = leadsQuery.data?.items ?? [];
  const total = leadsQuery.data?.total ?? 0;
  const totalPages = leadsQuery.data?.totalPages ?? 1;

  const detailBasePath =
    area === "admin" ? APP_ROUTES.dashboardAdminLeads : APP_ROUTES.dashboardStaffLeads;

  return (
    <div className="space-y-6">
      <Panel
        title={area === "admin" ? "Lead Management" : "Assigned Leads"}
        subtitle={
          area === "admin"
            ? "View, assign, update, convert, and manage all inbound leads."
            : "View and update only the leads assigned to your account."
        }
        action={
          area === "admin" ? (
            <button
              type="button"
              className="btn-gold"
              onClick={() => {
                setForm(buildEmptyLeadForm());
                setIsCreateOpen(true);
              }}
            >
              Create Lead
            </button>
          ) : undefined
        }
      >
        <TableToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Search by name, phone, or email..."
          summary={`${total} matching lead records`}
        />

        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <SelectMenu
            value={status}
            onValueChange={setStatus}
            className="h-auto bg-slate-50 py-3"
            options={[
              { value: "", label: "All statuses" },
              ...LEAD_STATUS_OPTIONS.map((option) => ({
                value: option,
                label: option.replace("_", " "),
              })),
            ]}
          />
          <input
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="Country"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          />
          <input
            value={service}
            onChange={(event) => setService(event.target.value)}
            placeholder="Service"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
          />
          {area === "admin" ? (
            <SelectMenu
              value={staffId}
              onValueChange={setStaffId}
              className="h-auto bg-slate-50 py-3"
              options={[
                { value: "", label: "All staff" },
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

        {leadsQuery.isLoading ? (
          <EmptyHint message="Loading lead records..." loading />
        ) : leadsQuery.isError ? (
          <EmptyHint message="Unable to load lead records." tone="error" />
        ) : (
          <>
            <DataTable
              columns={[
                "Lead",
                "Country",
                "Service",
                "Status",
                "Assigned",
                "Follow-up",
                "Created",
                "Action",
              ]}
              rows={leads.map((lead) => [
                <div className="text-left">
                  <p className="font-semibold text-slate-900">{lead.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {lead.email || lead.phone || "No contact info"}
                  </p>
                </div>,
                lead.interestedCountry || "—",
                lead.interestedService || "—",
                <StatusBadge tone={getStatusTone(lead.status)}>
                  {lead.status.replace("_", " ")}
                </StatusBadge>,
                lead.assignedStaffName || "Unassigned",
                formatDate(lead.nextFollowUpDate),
                formatDate(lead.createdAt),
                <div className="flex items-center justify-center gap-2">
                  {area === "admin" ? (
                    <Link
                      to={buildPath("/dashboard/admin/leads/:leadId", {
                        params: { leadId: lead.id },
                      })}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </Link>
                  ) : (
                    <Link
                      to={buildPath("/dashboard/staff/leads/:leadId", {
                        params: { leadId: lead.id },
                      })}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </Link>
                  )}
                  {area === "admin" ? (
                    <button
                      type="button"
                      className="rounded-xl border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive"
                      onClick={async () => {
                        try {
                          const confirmed = await dialogs.confirm({
                            title: "Delete lead?",
                            description: `Delete lead ${lead.fullName}. This action cannot be undone.`,
                            confirmLabel: "Delete",
                            tone: "destructive",
                          });

                          if (!confirmed) {
                            return;
                          }

                          await deleteLeadMutation.mutateAsync(lead.id);
                          toast.success("Lead deleted.");
                        } catch (error) {
                          toast.error(
                            error instanceof Error ? error.message : "Unable to delete the lead.",
                          );
                        }
                      }}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>,
              ])}
              emptyMessage={deferredSearch ? "No matching leads found." : "No leads found yet."}
            />
            <PaginationControls
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              total={total}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-4xl overflow-y-auto border-slate-200 p-0 sm:max-h-[90vh]">
            <DialogHeader className="border-b border-slate-200 px-6 py-5">
              <DialogTitle className="font-display text-2xl font-extrabold text-slate-950">
                Create Lead
              </DialogTitle>
              <DialogDescription>
                Add a new lead record without leaving the list view.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 py-6">
              <LeadForm
                form={form}
                onChange={setForm}
                staffUsers={staffUsers.map((user) => ({ id: user.id, name: user.name }))}
                mode="admin"
                onSubmit={async () => {
                  try {
                    const lead = await submitLeadWithDuplicateOverride(
                      upsertLeadMutation,
                      form,
                      (message) =>
                        dialogs.confirm({
                          title: "Potential duplicate lead",
                          description: `${message} Continue and save this lead anyway?`,
                          confirmLabel: "Continue",
                        }),
                    );
                    toast.success("Lead created.");
                    setIsCreateOpen(false);
                    if (area === "admin") {
                      navigate("/dashboard/admin/leads/:leadId", { params: { leadId: lead.id } });
                    } else {
                      navigate("/dashboard/staff/leads/:leadId", { params: { leadId: lead.id } });
                    }
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Unable to create the lead.",
                    );
                  }
                }}
                isSubmitting={upsertLeadMutation.isPending}
              />
            </div>
          </DialogContent>
        </Dialog>
      </Panel>
    </div>
  );
}

export function LeadDetailPage({ area, leadId }: { area: "admin" | "staff"; leadId: string }) {
  const navigate = useAppNavigate();
  const dialogs = useAppDialogs();
  const { data: currentUser } = useCurrentUser();
  const access = useDashboardAccess();
  const leadQuery = useLead(leadId, access.canReadLeads);
  const upsertLeadMutation = useUpsertLead();
  const convertLeadMutation = useConvertLead();
  const deleteLeadMutation = useDeleteLead();
  const staffUsersQuery = useInternalUsers({
    enabled: area === "admin",
    page: 1,
    pageSize: 100,
    search: "",
  });
  const [form, setForm] = useState<UpsertLeadInput | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const detailBasePath =
    area === "admin" ? APP_ROUTES.dashboardAdminLeads : APP_ROUTES.dashboardStaffLeads;
  const clientBasePath =
    area === "admin" ? APP_ROUTES.dashboardAdminClients : APP_ROUTES.dashboardStaffClients;

  useEffect(() => {
    if (leadQuery.data?.lead) {
      setForm(mapLeadToForm(leadQuery.data.lead));
    }
  }, [leadQuery.data]);

  const staffUsers = useMemo(
    () => (staffUsersQuery.data?.items ?? []).filter((user) => user.role === "staff"),
    [staffUsersQuery.data],
  );

  if (leadQuery.isError || !leadQuery.data) {
    return <EmptyHint message="Unable to load lead details." tone="error" />;
  }

  const lead = leadQuery.data?.lead;
  const history = leadQuery.data?.history ?? [];
  const isAdmin = area === "admin";
  const isBlockingLoad = !lead || !form;
  const isOverlayVisible = leadQuery.isFetching || isBlockingLoad;

  return (
    <div className="space-y-6">
      <Panel
        className="relative overflow-hidden"
        title={lead?.fullName ?? "Lead Details"}
        subtitle={
          isAdmin
            ? "Update lead details, assignment, status, and conversion from this page."
            : "You can update the assigned lead status, follow-up date, and internal notes."
        }
        action={
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => navigate(detailBasePath)}
            >
              Back to Leads
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={() => {
                if (lead) {
                  setForm(mapLeadToForm(lead));
                }
                setIsEditOpen(true);
              }}
            >
              Edit Lead
            </button>
            {isAdmin && lead && !lead.convertedClientId ? (
              <button
              type="button"
              className="btn-gold"
              onClick={async () => {
                  const notes =
                    (await dialogs.prompt({
                      title: "Convert lead to client",
                      description: "Add optional conversion notes before continuing.",
                      label: "Conversion notes",
                      placeholder: "Optional notes",
                      confirmLabel: "Convert",
                    })) ?? "";

                  try {
                    const result = await convertLeadMutation.mutateAsync({ id: lead.id, notes });
                    toast.success(`Lead converted to client ${result.client.name}.`);
                    navigate(clientBasePath);
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Unable to convert the lead.",
                    );
                  }
                }}
              >
                Convert to Client
              </button>
            ) : null}
            {isAdmin ? (
              <button
              type="button"
              className="rounded-xl border border-destructive/20 px-4 py-2 text-sm font-semibold text-destructive"
              onClick={async () => {
                  const confirmed = await dialogs.confirm({
                    title: "Delete lead?",
                    description: `Delete lead ${lead.fullName}. This action cannot be undone.`,
                    confirmLabel: "Delete",
                    tone: "destructive",
                  });

                  if (!confirmed) {
                    return;
                  }

                  try {
                    await deleteLeadMutation.mutateAsync(lead.id);
                    toast.success("Lead deleted.");
                    navigate(detailBasePath);
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Unable to delete the lead.",
                    );
                  }
                }}
              >
                Delete Lead
              </button>
            ) : null}
          </div>
        }
      >
        {lead ? (
          <LeadOverview lead={lead} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <Skeleton className="h-3 w-24 rounded-full bg-slate-200" />
                <Skeleton className="mt-4 h-6 w-3/4 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        )}
        {isOverlayVisible ? <LoadingOverlay label="Loading lead details..." /> : null}
      </Panel>

      <Dialog open={isEditOpen && Boolean(form)} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl overflow-y-auto border-slate-200 p-0 sm:max-h-[90vh]">
          <DialogHeader className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="font-display text-2xl font-extrabold text-slate-950">
              Edit Lead
            </DialogTitle>
            <DialogDescription>
              Update lead details, assignment, status, and follow-up planning.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-6">
            <LeadForm
              form={form ?? buildEmptyLeadForm()}
              onChange={setForm}
              staffUsers={staffUsers.map((user) => ({ id: user.id, name: user.name }))}
              mode={isAdmin ? "admin" : "staff"}
              onSubmit={async () => {
                if (!form) return;
                try {
                  await submitLeadWithDuplicateOverride(
                    upsertLeadMutation,
                    form,
                    (message) =>
                      dialogs.confirm({
                        title: "Potential duplicate lead",
                        description: `${message} Continue and save this lead anyway?`,
                        confirmLabel: "Continue",
                      }),
                  );
                  toast.success("Lead updated.");
                  setIsEditOpen(false);
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to update the lead.");
                }
              }}
              isSubmitting={upsertLeadMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Panel
        title="Lead History"
        subtitle="Conversion and update history remains attached to the lead record."
      >
        {history.length === 0 ? (
          <EmptyHint message="No history events recorded yet." />
        ) : (
          <div className="space-y-3">
            {history.map((event) => (
              <div
                key={event.id}
                className="rounded-[20px] border border-slate-200 bg-slate-50 px-5 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{event.description}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {event.actorType === "user"
                        ? event.actorName || currentUser?.name || "Internal user"
                        : "System"}
                    </p>
                  </div>
                  <Badge variant="light">{new Date(event.createdAt).toLocaleString()}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function LeadOverview({ lead }: { lead: Lead }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ReadOnlyField label="Full Name" value={lead.fullName} />
        <ReadOnlyField label="Phone" value={lead.phone || "—"} />
        <ReadOnlyField label="Email" value={lead.email || "—"} />
        <ReadOnlyField label="Interested Country" value={lead.interestedCountry || "—"} />
        <ReadOnlyField label="Interested Service" value={lead.interestedService || "—"} />
        <ReadOnlyField label="Status" value={lead.status.replace("_", " ")} />
        <ReadOnlyField label="Source" value={lead.source.replace("_", " ")} />
        <ReadOnlyField label="Assigned Staff" value={lead.assignedStaffName || "Unassigned"} />
        <ReadOnlyField label="Next Follow-up" value={formatDate(lead.nextFollowUpDate)} />
      </div>
      <ReadOnlyTextBlock label="Message / Comments" value={lead.message || "No message added."} />
      <ReadOnlyTextBlock label="Internal Notes" value={lead.internalNotes || "No internal notes added."} />
    </div>
  );
}

function LeadForm({
  form,
  onChange,
  staffUsers,
  mode,
  onSubmit,
  isSubmitting,
}: {
  form: UpsertLeadInput;
  onChange: (value: UpsertLeadInput) => void;
  staffUsers: Array<{ id: string; name: string }>;
  mode: "admin" | "staff";
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const isAdmin = mode === "admin";

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
          label="Phone"
          value={form.phone}
          onChange={(phone) => onChange({ ...form, phone })}
        />
        <TextField
          label="Email"
          value={form.email}
          onChange={(email) => onChange({ ...form, email })}
        />
        <TextField
          label="Interested Country"
          value={form.interestedCountry}
          onChange={(interestedCountry) => onChange({ ...form, interestedCountry })}
        />
        <TextField
          label="Interested Service"
          value={form.interestedService}
          onChange={(interestedService) => onChange({ ...form, interestedService })}
        />
        <SelectField
          label="Status"
          value={form.status}
          onChange={(status) => onChange({ ...form, status: status as LeadStatus })}
          options={LEAD_STATUS_OPTIONS.map((option) => ({
            value: option,
            label: option.replace("_", " "),
          }))}
        />
        <SelectField
          label="Source"
          value={form.source}
          disabled={!isAdmin}
          onChange={(source) => onChange({ ...form, source: source as LeadSource })}
          options={LEAD_SOURCE_OPTIONS.map((option) => ({
            value: option,
            label: option.replace("_", " "),
          }))}
        />
        <SelectField
          label="Assigned Staff"
          value={form.assignedStaffUserId ?? ""}
          disabled={!isAdmin}
          onChange={(assignedStaffUserId) =>
            onChange({ ...form, assignedStaffUserId: assignedStaffUserId || null })
          }
          options={[
            { value: "", label: "Unassigned" },
            ...staffUsers.map((user) => ({ value: user.id, label: user.name })),
          ]}
        />
        <TextField
          label="Next Follow-up Date"
          type="date"
          value={form.nextFollowUpDate}
          onChange={(nextFollowUpDate) => onChange({ ...form, nextFollowUpDate })}
        />
      </div>

      <TextAreaField
        label="Message / Comments"
        value={form.message}
        onChange={(message) => onChange({ ...form, message })}
      />
      <TextAreaField
        label="Internal Notes"
        value={form.internalNotes}
        onChange={(internalNotes) => onChange({ ...form, internalNotes })}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-gold min-w-[160px] justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Lead"}
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

function ReadOnlyTextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-600">{value}</p>
    </div>
  );
}
