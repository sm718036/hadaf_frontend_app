import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SelectMenu } from "@/components/ui/select-menu";
import type { UpsertDocumentRuleInput } from "@/features/digital-vault/digital-vault.schemas";
import { useDigitalVault, useSaveDocumentRule } from "@/features/digital-vault/use-digital-vault";
import { useConfigurationVaultMetadata } from "@/features/configuration-vault/use-configuration-vault";
import { useDashboardAccess } from "@/features/dashboard/use-dashboard-access";
import { EmptyHint, Panel } from "@/features/dashboard/dashboard-ui";

function createRuleForm(): UpsertDocumentRuleInput {
  return {
    countryId: "",
    visaCategoryId: null,
    documentTitle: "",
    documentType: "",
    minStudentAge: null,
    maxStudentAge: null,
    isRequired: true,
    visibleToClient: true,
    tracksExpiry: false,
    expiryAlertMonths: 6,
    notes: "",
    displayOrder: 0,
    isActive: true,
  };
}

export function DashboardDigitalVaultPage() {
  const access = useDashboardAccess();
  const vaultMetadataQuery = useConfigurationVaultMetadata(access.currentUser.role === "admin");
  const digitalVaultQuery = useDigitalVault(access.currentUser.role === "admin");
  const saveRuleMutation = useSaveDocumentRule();
  const [form, setForm] = useState(createRuleForm());

  const visaOptions = useMemo(
    () =>
      (vaultMetadataQuery.data?.visaCategories ?? [])
        .filter((item) => item.countryId === form.countryId)
        .map((item) => ({ value: item.id, label: `${item.code} · ${item.name}` })),
    [vaultMetadataQuery.data?.visaCategories, form.countryId],
  );

  if (access.currentUser.role !== "admin") {
    return <EmptyHint message="Only administrators can access the Digital Vault." tone="error" />;
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Digital Vault & Verification"
        subtitle="Define the rule matrix that generates dynamic checklists and controls expiry monitoring."
        action={
          <button
            type="button"
            className="btn-gold"
            disabled={saveRuleMutation.isPending}
            onClick={async () => {
              try {
                await saveRuleMutation.mutateAsync(form);
                toast.success("Rule saved.");
                setForm(createRuleForm());
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to save the rule.");
              }
            }}
          >
            {saveRuleMutation.isPending ? "Saving..." : form.id ? "Update Rule" : "Add Rule"}
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Country"
            value={form.countryId}
            onChange={(countryId) => setForm({ ...form, countryId, visaCategoryId: null })}
            options={(vaultMetadataQuery.data?.countries ?? []).map((item) => ({ value: item.id, label: item.name }))}
          />
          <SelectField
            label="Visa"
            value={form.visaCategoryId ?? ""}
            onChange={(visaCategoryId) => setForm({ ...form, visaCategoryId: visaCategoryId || null })}
            options={[{ value: "", label: "Any visa type" }, ...visaOptions]}
          />
          <TextField label="Document Title" value={form.documentTitle} onChange={(documentTitle) => setForm({ ...form, documentTitle })} />
          <TextField label="Document Type" value={form.documentType} onChange={(documentType) => setForm({ ...form, documentType })} />
          <NumberField label="Min Age" value={form.minStudentAge} onChange={(minStudentAge) => setForm({ ...form, minStudentAge })} />
          <NumberField label="Max Age" value={form.maxStudentAge} onChange={(maxStudentAge) => setForm({ ...form, maxStudentAge })} />
          <NumberField label="Alert Months" value={form.expiryAlertMonths} onChange={(expiryAlertMonths) => setForm({ ...form, expiryAlertMonths: expiryAlertMonths ?? 6 })} />
          <NumberField label="Order" value={form.displayOrder} onChange={(displayOrder) => setForm({ ...form, displayOrder: displayOrder ?? 0 })} />
        </div>
        <div className="mt-4">
          <TextAreaField label="Rule Notes" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ToggleField label="Required" checked={form.isRequired} onChange={(isRequired) => setForm({ ...form, isRequired })} />
          <ToggleField label="Visible to client" checked={form.visibleToClient} onChange={(visibleToClient) => setForm({ ...form, visibleToClient })} />
          <ToggleField label="Tracks expiry" checked={form.tracksExpiry} onChange={(tracksExpiry) => setForm({ ...form, tracksExpiry })} />
          <ToggleField label="Active" checked={form.isActive} onChange={(isActive) => setForm({ ...form, isActive })} />
        </div>
      </Panel>

      <Panel title="Rule Matrix" subtitle="Generated checklist rules are matched by country, visa, and age constraints.">
        {(digitalVaultQuery.data?.rules ?? []).length === 0 ? (
          <EmptyHint message="No document rules configured yet." />
        ) : (
          <div className="space-y-3">
            {(digitalVaultQuery.data?.rules ?? []).map((rule) => (
              <div key={rule.id} className="flex flex-wrap items-start justify-between gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{rule.documentTitle}</p>
                    <Badge variant={rule.isActive ? "success" : "warning"}>{rule.isActive ? "active" : "inactive"}</Badge>
                    {rule.tracksExpiry ? <Badge variant="dark">expiry alert</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {rule.countryName} · {rule.visaCategoryName ?? "Any visa"} · {rule.documentType}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Age {rule.minStudentAge ?? "any"} to {rule.maxStudentAge ?? "any"} · Alert {rule.expiryAlertMonths} months
                  </p>
                  {rule.notes ? <p className="mt-2 text-sm text-slate-600">{rule.notes}</p> : null}
                </div>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                  onClick={() =>
                    setForm({
                      id: rule.id,
                      countryId: rule.countryId,
                      visaCategoryId: rule.visaCategoryId,
                      documentTitle: rule.documentTitle,
                      documentType: rule.documentType,
                      minStudentAge: rule.minStudentAge,
                      maxStudentAge: rule.maxStudentAge,
                      isRequired: rule.isRequired,
                      visibleToClient: rule.visibleToClient,
                      tracksExpiry: rule.tracksExpiry,
                      expiryAlertMonths: rule.expiryAlertMonths,
                      notes: rule.notes ?? "",
                      displayOrder: rule.displayOrder,
                      isActive: rule.isActive,
                    })
                  }
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <SelectMenu value={value} onValueChange={onChange} options={options} />
    </label>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number | null) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input type="number" value={value ?? ""} onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
    </label>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
