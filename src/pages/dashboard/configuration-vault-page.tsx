import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SelectMenu } from "@/components/ui/select-menu";
import {
  useConfigurationVault,
  useSaveVaultCountry,
  useSaveVaultDocumentChecklist,
  useSaveVaultFinancialRule,
  useSaveVaultVisaCategory,
  useSaveVaultWorkflowStage,
} from "@/features/configuration-vault/use-configuration-vault";
import type {
  UpsertVaultCountryInput,
  UpsertVaultDocumentChecklistInput,
  UpsertVaultFinancialRuleInput,
  UpsertVaultVisaCategoryInput,
  UpsertVaultWorkflowStageInput,
  VaultCountry,
  VaultDocumentChecklist,
  VaultFinancialRule,
  VaultVisaCategory,
  VaultWorkflowStage,
} from "@/features/configuration-vault/configuration-vault.schemas";
import { useDashboardAccess } from "@/features/dashboard/use-dashboard-access";
import { EmptyHint, LoadingOverlay, Panel } from "@/features/dashboard/dashboard-ui";

function createCountryForm(): UpsertVaultCountryInput {
  return { name: "", isoCode: "", baseCurrency: "", displayOrder: 0, isActive: true };
}

function createVisaCategoryForm(): UpsertVaultVisaCategoryInput {
  return {
    countryId: "",
    name: "",
    code: "",
    description: "",
    displayOrder: 0,
    isActive: true,
  };
}

function createWorkflowStageForm(): UpsertVaultWorkflowStageInput {
  return { name: "", description: "", displayOrder: 0, isActive: true };
}

function createDocumentChecklistForm(): UpsertVaultDocumentChecklistInput {
  return {
    countryId: "",
    visaCategoryId: null,
    title: "",
    notes: "",
    isRequired: true,
    displayOrder: 0,
    isActive: true,
  };
}

function createFinancialRuleForm(): UpsertVaultFinancialRuleInput {
  return {
    countryId: "",
    visaCategoryId: null,
    label: "",
    amount: 0,
    currency: "",
    notes: "",
    displayOrder: 0,
    isActive: true,
  };
}

export function DashboardConfigurationVaultPage() {
  const access = useDashboardAccess();
  const vaultQuery = useConfigurationVault(access.currentUser.role === "admin");
  const saveCountryMutation = useSaveVaultCountry();
  const saveVisaCategoryMutation = useSaveVaultVisaCategory();
  const saveWorkflowStageMutation = useSaveVaultWorkflowStage();
  const saveDocumentChecklistMutation = useSaveVaultDocumentChecklist();
  const saveFinancialRuleMutation = useSaveVaultFinancialRule();

  const [countryForm, setCountryForm] = useState<UpsertVaultCountryInput>(createCountryForm());
  const [visaCategoryForm, setVisaCategoryForm] = useState<UpsertVaultVisaCategoryInput>(createVisaCategoryForm());
  const [workflowStageForm, setWorkflowStageForm] = useState<UpsertVaultWorkflowStageInput>(createWorkflowStageForm());
  const [documentChecklistForm, setDocumentChecklistForm] = useState<UpsertVaultDocumentChecklistInput>(createDocumentChecklistForm());
  const [financialRuleForm, setFinancialRuleForm] = useState<UpsertVaultFinancialRuleInput>(createFinancialRuleForm());

  const snapshot = vaultQuery.data;
  const countries = snapshot?.countries ?? [];
  const visaCategories = snapshot?.visaCategories ?? [];

  const visaCategoryOptions = useMemo(
    () =>
      visaCategories
        .filter((item) => item.countryId === visaCategoryForm.countryId)
        .map((item) => ({ value: item.id, label: `${item.code} · ${item.name}` })),
    [visaCategories, visaCategoryForm.countryId],
  );

  const checklistVisaCategoryOptions = useMemo(
    () =>
      visaCategories
        .filter((item) => item.countryId === documentChecklistForm.countryId)
        .map((item) => ({ value: item.id, label: `${item.code} · ${item.name}` })),
    [visaCategories, documentChecklistForm.countryId],
  );

  const ruleVisaCategoryOptions = useMemo(
    () =>
      visaCategories
        .filter((item) => item.countryId === financialRuleForm.countryId)
        .map((item) => ({ value: item.id, label: `${item.code} · ${item.name}` })),
    [visaCategories, financialRuleForm.countryId],
  );

  if (access.currentUser.role !== "admin") {
    return <EmptyHint message="Only administrators can access the Configuration Vault." tone="error" />;
  }

  return (
    <div className="space-y-6">
      <Panel
        className="relative overflow-hidden"
        title="Configuration Vault"
        subtitle="Manually manage countries, visa types, workflow stages, document checklists, and financial rules. Vault records are deactivated instead of deleted so historical applications stay intact."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <VaultStat label="Countries" value={countries.length} detail="Destinations and currencies" />
          <VaultStat label="Visa Categories" value={visaCategories.length} detail="Country-linked service types" />
          <VaultStat label="Workflow Stages" value={snapshot?.workflowStages.length ?? 0} detail="Progress bar stages" />
        </div>
        {vaultQuery.isFetching && snapshot ? <LoadingOverlay label="Refreshing vault..." /> : null}
      </Panel>

      <EntityPanel
        title="Country Manager"
        subtitle="Create destinations with ISO codes and base currencies. New countries automatically receive starter checklist and financial templates."
        actionLabel={countryForm.id ? "Update Country" : "Add Country"}
        onSubmit={async () => {
          try {
            await saveCountryMutation.mutateAsync(countryForm);
            toast.success(countryForm.id ? "Country updated." : "Country added.");
            setCountryForm(createCountryForm());
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save the country.");
          }
        }}
        isSubmitting={saveCountryMutation.isPending}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TextField label="Country Name" value={countryForm.name} onChange={(name) => setCountryForm({ ...countryForm, name })} />
          <TextField label="ISO Code" value={countryForm.isoCode} onChange={(isoCode) => setCountryForm({ ...countryForm, isoCode: isoCode.toUpperCase() })} />
          <TextField label="Base Currency" value={countryForm.baseCurrency} onChange={(baseCurrency) => setCountryForm({ ...countryForm, baseCurrency: baseCurrency.toUpperCase() })} />
          <NumberField label="Display Order" value={countryForm.displayOrder} onChange={(displayOrder) => setCountryForm({ ...countryForm, displayOrder })} />
        </div>
        <div className="mt-4">
          <ToggleField label="Country is active" checked={countryForm.isActive} onChange={(isActive) => setCountryForm({ ...countryForm, isActive })} />
        </div>
        <VaultList
          items={countries}
          emptyMessage="No countries configured yet."
          renderItem={(country) => (
            <VaultRow
              key={country.id}
              title={country.name}
              subtitle={`${country.isoCode} · ${country.baseCurrency}`}
              meta={`Order ${country.displayOrder}`}
              isActive={country.isActive}
              onEdit={() => setCountryForm(toCountryForm(country))}
            />
          )}
        />
      </EntityPanel>

      <EntityPanel
        title="Visa Category Designer"
        subtitle="Define country-specific visa types such as Study, Tourist, Work, PR, or destination-only variants like H1-B for the USA."
        actionLabel={visaCategoryForm.id ? "Update Category" : "Add Category"}
        onSubmit={async () => {
          try {
            await saveVisaCategoryMutation.mutateAsync(visaCategoryForm);
            toast.success(visaCategoryForm.id ? "Visa category updated." : "Visa category added.");
            setVisaCategoryForm(createVisaCategoryForm());
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save the visa category.");
          }
        }}
        isSubmitting={saveVisaCategoryMutation.isPending}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Country"
            value={visaCategoryForm.countryId}
            onChange={(countryId) => setVisaCategoryForm({ ...visaCategoryForm, countryId })}
            options={countries.map((country) => ({ value: country.id, label: country.name }))}
          />
          <TextField label="Category Name" value={visaCategoryForm.name} onChange={(name) => setVisaCategoryForm({ ...visaCategoryForm, name })} />
          <TextField label="Category Code" value={visaCategoryForm.code} onChange={(code) => setVisaCategoryForm({ ...visaCategoryForm, code })} />
          <NumberField label="Display Order" value={visaCategoryForm.displayOrder} onChange={(displayOrder) => setVisaCategoryForm({ ...visaCategoryForm, displayOrder })} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
          <TextAreaField label="Description" value={visaCategoryForm.description} onChange={(description) => setVisaCategoryForm({ ...visaCategoryForm, description })} />
          <ToggleField label="Category is active" checked={visaCategoryForm.isActive} onChange={(isActive) => setVisaCategoryForm({ ...visaCategoryForm, isActive })} />
        </div>
        <VaultList
          items={visaCategories}
          emptyMessage="No visa categories configured yet."
          renderItem={(category) => (
            <VaultRow
              key={category.id}
              title={`${category.code} · ${category.name}`}
              subtitle={category.countryName}
              meta={`Order ${category.displayOrder}`}
              isActive={category.isActive}
              description={category.description}
              onEdit={() => setVisaCategoryForm(toVisaCategoryForm(category))}
            />
          )}
        />
      </EntityPanel>

      <EntityPanel
        title="Workflow Stage Builder"
        subtitle="Define the ordered steps that drive the application progress bar and internal delivery workflow."
        actionLabel={workflowStageForm.id ? "Update Stage" : "Add Stage"}
        onSubmit={async () => {
          try {
            await saveWorkflowStageMutation.mutateAsync(workflowStageForm);
            toast.success(workflowStageForm.id ? "Workflow stage updated." : "Workflow stage added.");
            setWorkflowStageForm(createWorkflowStageForm());
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save the workflow stage.");
          }
        }}
        isSubmitting={saveWorkflowStageMutation.isPending}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TextField label="Stage Name" value={workflowStageForm.name} onChange={(name) => setWorkflowStageForm({ ...workflowStageForm, name })} />
          <NumberField label="Display Order" value={workflowStageForm.displayOrder} onChange={(displayOrder) => setWorkflowStageForm({ ...workflowStageForm, displayOrder })} />
          <ToggleField label="Stage is active" checked={workflowStageForm.isActive} onChange={(isActive) => setWorkflowStageForm({ ...workflowStageForm, isActive })} />
        </div>
        <div className="mt-4">
          <TextAreaField label="Description" value={workflowStageForm.description} onChange={(description) => setWorkflowStageForm({ ...workflowStageForm, description })} />
        </div>
        <VaultList
          items={snapshot?.workflowStages ?? []}
          emptyMessage="No workflow stages configured yet."
          renderItem={(stage) => (
            <VaultRow
              key={stage.id}
              title={stage.name}
              subtitle={`Order ${stage.displayOrder}`}
              meta={stage.description ? "Custom stage detail saved" : "No description"}
              isActive={stage.isActive}
              description={stage.description}
              onEdit={() => setWorkflowStageForm(toWorkflowStageForm(stage))}
            />
          )}
        />
      </EntityPanel>

      <EntityPanel
        title="Document Checklist Templates"
        subtitle="Country-level or category-specific checklist rules become available as soon as a destination exists."
        actionLabel={documentChecklistForm.id ? "Update Checklist" : "Add Checklist"}
        onSubmit={async () => {
          try {
            await saveDocumentChecklistMutation.mutateAsync(documentChecklistForm);
            toast.success(documentChecklistForm.id ? "Checklist updated." : "Checklist added.");
            setDocumentChecklistForm(createDocumentChecklistForm());
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save the checklist.");
          }
        }}
        isSubmitting={saveDocumentChecklistMutation.isPending}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Country"
            value={documentChecklistForm.countryId}
            onChange={(countryId) =>
              setDocumentChecklistForm({ ...documentChecklistForm, countryId, visaCategoryId: null })
            }
            options={countries.map((country) => ({ value: country.id, label: country.name }))}
          />
          <SelectField
            label="Visa Category"
            value={documentChecklistForm.visaCategoryId ?? ""}
            onChange={(visaCategoryId) =>
              setDocumentChecklistForm({
                ...documentChecklistForm,
                visaCategoryId: visaCategoryId || null,
              })
            }
            options={[{ value: "", label: "All categories" }, ...checklistVisaCategoryOptions]}
          />
          <TextField label="Checklist Title" value={documentChecklistForm.title} onChange={(title) => setDocumentChecklistForm({ ...documentChecklistForm, title })} />
          <NumberField label="Display Order" value={documentChecklistForm.displayOrder} onChange={(displayOrder) => setDocumentChecklistForm({ ...documentChecklistForm, displayOrder })} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <TextAreaField label="Notes" value={documentChecklistForm.notes} onChange={(notes) => setDocumentChecklistForm({ ...documentChecklistForm, notes })} />
          <ToggleField label="Required for applicants" checked={documentChecklistForm.isRequired} onChange={(isRequired) => setDocumentChecklistForm({ ...documentChecklistForm, isRequired })} />
          <ToggleField label="Checklist is active" checked={documentChecklistForm.isActive} onChange={(isActive) => setDocumentChecklistForm({ ...documentChecklistForm, isActive })} />
        </div>
        <VaultList
          items={snapshot?.documentChecklists ?? []}
          emptyMessage="No checklist templates configured yet."
          renderItem={(checklist) => (
            <VaultRow
              key={checklist.id}
              title={checklist.title}
              subtitle={`${checklist.countryName}${checklist.visaCategoryName ? ` · ${checklist.visaCategoryName}` : " · All categories"}`}
              meta={`${checklist.isRequired ? "Required" : "Optional"} · Order ${checklist.displayOrder}`}
              isActive={checklist.isActive}
              description={checklist.notes}
              onEdit={() => setDocumentChecklistForm(toDocumentChecklistForm(checklist))}
            />
          )}
        />
      </EntityPanel>

      <EntityPanel
        title="Financial Rule Templates"
        subtitle="Keep per-country and per-category funding, fee, and currency rules inside the vault rather than scattering them across application screens."
        actionLabel={financialRuleForm.id ? "Update Rule" : "Add Rule"}
        onSubmit={async () => {
          try {
            await saveFinancialRuleMutation.mutateAsync(financialRuleForm);
            toast.success(financialRuleForm.id ? "Financial rule updated." : "Financial rule added.");
            setFinancialRuleForm(createFinancialRuleForm());
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save the financial rule.");
          }
        }}
        isSubmitting={saveFinancialRuleMutation.isPending}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <SelectField
            label="Country"
            value={financialRuleForm.countryId}
            onChange={(countryId) => {
              const selectedCountry = countries.find((item) => item.id === countryId);
              setFinancialRuleForm({
                ...financialRuleForm,
                countryId,
                visaCategoryId: null,
                currency: selectedCountry?.baseCurrency ?? financialRuleForm.currency,
              });
            }}
            options={countries.map((country) => ({ value: country.id, label: country.name }))}
          />
          <SelectField
            label="Visa Category"
            value={financialRuleForm.visaCategoryId ?? ""}
            onChange={(visaCategoryId) =>
              setFinancialRuleForm({
                ...financialRuleForm,
                visaCategoryId: visaCategoryId || null,
              })
            }
            options={[{ value: "", label: "All categories" }, ...ruleVisaCategoryOptions]}
          />
          <TextField label="Rule Label" value={financialRuleForm.label} onChange={(label) => setFinancialRuleForm({ ...financialRuleForm, label })} />
          <NumberField label="Amount" value={financialRuleForm.amount} onChange={(amount) => setFinancialRuleForm({ ...financialRuleForm, amount })} step="0.01" />
          <TextField label="Currency" value={financialRuleForm.currency} onChange={(currency) => setFinancialRuleForm({ ...financialRuleForm, currency: currency.toUpperCase() })} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_auto_auto]">
          <TextAreaField label="Notes" value={financialRuleForm.notes} onChange={(notes) => setFinancialRuleForm({ ...financialRuleForm, notes })} />
          <NumberField label="Display Order" value={financialRuleForm.displayOrder} onChange={(displayOrder) => setFinancialRuleForm({ ...financialRuleForm, displayOrder })} />
          <ToggleField label="Financial rule is active" checked={financialRuleForm.isActive} onChange={(isActive) => setFinancialRuleForm({ ...financialRuleForm, isActive })} />
        </div>
        <VaultList
          items={snapshot?.financialRules ?? []}
          emptyMessage="No financial rule templates configured yet."
          renderItem={(rule) => (
            <VaultRow
              key={rule.id}
              title={`${rule.currency} ${rule.amount.toFixed(2)} · ${rule.label}`}
              subtitle={`${rule.countryName}${rule.visaCategoryName ? ` · ${rule.visaCategoryName}` : " · All categories"}`}
              meta={`Order ${rule.displayOrder}`}
              isActive={rule.isActive}
              description={rule.notes}
              onEdit={() => setFinancialRuleForm(toFinancialRuleForm(rule))}
            />
          )}
        />
      </EntityPanel>

      {vaultQuery.isLoading ? <EmptyHint message="Loading configuration vault..." loading /> : null}
      {vaultQuery.isError ? <EmptyHint message="Unable to load the configuration vault." tone="error" /> : null}
    </div>
  );
}

function VaultStat({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-3 text-4xl font-display font-extrabold text-slate-950">{value}</div>
      <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {detail}
      </div>
    </div>
  );
}

function EntityPanel({
  title,
  subtitle,
  children,
  actionLabel,
  onSubmit,
  isSubmitting,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  actionLabel: string;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Panel
      title={title}
      subtitle={subtitle}
      action={
        <button type="button" className="btn-gold" disabled={isSubmitting} onClick={onSubmit}>
          {isSubmitting ? "Saving..." : actionLabel}
        </button>
      }
    >
      {children}
    </Panel>
  );
}

function VaultList<T>({
  items,
  emptyMessage,
  renderItem,
}: {
  items: T[];
  emptyMessage: string;
  renderItem: (item: T) => ReactNode;
}) {
  return <div className="mt-6 space-y-3">{items.length === 0 ? <EmptyHint message={emptyMessage} /> : items.map(renderItem)}</div>;
}

function VaultRow({
  title,
  subtitle,
  meta,
  isActive,
  onEdit,
  description,
}: {
  title: string;
  subtitle: string;
  meta: string;
  isActive: boolean;
  onEdit: () => void;
  description?: string | null;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">{title}</p>
            <Badge variant={isActive ? "success" : "warning"}>{isActive ? "active" : "inactive"}</Badge>
          </div>
          <p className="text-sm text-slate-500">{subtitle}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{meta}</p>
          {description ? <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
          <Pencil className="h-4 w-4" />
          Edit
        </button>
      </div>
    </div>
  );
}

function TextField({
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
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300" />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = "1",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input type="number" step={step} value={value} onChange={(event) => onChange(Number(event.target.value || 0))} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300" />
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
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-300" />
    </label>
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

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex h-12 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <Badge variant={checked ? "success" : "warning"}>{checked ? "On" : "Off"}</Badge>
    </button>
  );
}

function toCountryForm(country: VaultCountry): UpsertVaultCountryInput {
  return {
    id: country.id,
    name: country.name,
    isoCode: country.isoCode,
    baseCurrency: country.baseCurrency,
    displayOrder: country.displayOrder,
    isActive: country.isActive,
  };
}

function toVisaCategoryForm(category: VaultVisaCategory): UpsertVaultVisaCategoryInput {
  return {
    id: category.id,
    countryId: category.countryId,
    name: category.name,
    code: category.code,
    description: category.description ?? "",
    displayOrder: category.displayOrder,
    isActive: category.isActive,
  };
}

function toWorkflowStageForm(stage: VaultWorkflowStage): UpsertVaultWorkflowStageInput {
  return {
    id: stage.id,
    name: stage.name,
    description: stage.description ?? "",
    displayOrder: stage.displayOrder,
    isActive: stage.isActive,
  };
}

function toDocumentChecklistForm(checklist: VaultDocumentChecklist): UpsertVaultDocumentChecklistInput {
  return {
    id: checklist.id,
    countryId: checklist.countryId,
    visaCategoryId: checklist.visaCategoryId,
    title: checklist.title,
    notes: checklist.notes ?? "",
    isRequired: checklist.isRequired,
    displayOrder: checklist.displayOrder,
    isActive: checklist.isActive,
  };
}

function toFinancialRuleForm(rule: VaultFinancialRule): UpsertVaultFinancialRuleInput {
  return {
    id: rule.id,
    countryId: rule.countryId,
    visaCategoryId: rule.visaCategoryId,
    label: rule.label,
    amount: rule.amount,
    currency: rule.currency,
    notes: rule.notes ?? "",
    displayOrder: rule.displayOrder,
    isActive: rule.isActive,
  };
}
