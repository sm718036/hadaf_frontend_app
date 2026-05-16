import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import type { UpsertFeeItemInput } from "@/features/financial-ledger/financial-ledger.schemas";
import { useFinancialLedger, useSaveFeeItem } from "@/features/financial-ledger/use-financial-ledger";
import { useDashboardAccess } from "@/features/dashboard/use-dashboard-access";
import { EmptyHint, Panel } from "@/features/dashboard/dashboard-ui";

function createFeeItemForm(): UpsertFeeItemInput {
  return {
    label: "",
    code: "",
    defaultAmount: 0,
    currency: "PKR",
    notes: "",
    displayOrder: 0,
    isActive: true,
  };
}

export function DashboardFinancialLedgerPage() {
  const access = useDashboardAccess();
  const ledgerQuery = useFinancialLedger(access.currentUser.role === "admin");
  const saveFeeItemMutation = useSaveFeeItem();
  const [form, setForm] = useState<UpsertFeeItemInput>(createFeeItemForm());

  if (access.currentUser.role !== "admin") {
    return <EmptyHint message="Only administrators can access the Financial Ledger." tone="error" />;
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Invoicing & Financial Ledger"
        subtitle="Configure reusable fee items and monitor expected university commission payouts from enrolled students."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <LedgerStat label="Fee Items" value={ledgerQuery.data?.feeItems.length ?? 0} />
          <LedgerStat label="University Rates" value={ledgerQuery.data?.universityCommissions.length ?? 0} />
          <LedgerStat label="Expected Payouts" value={ledgerQuery.data?.commissionPayouts.length ?? 0} />
        </div>
      </Panel>

      <Panel
        title="Custom Fee Schedule"
        subtitle="Create reusable fee items such as government fees, service charges, and GST."
        action={
          <button
            type="button"
            className="btn-gold"
            disabled={saveFeeItemMutation.isPending}
            onClick={async () => {
              try {
                await saveFeeItemMutation.mutateAsync(form);
                toast.success("Fee item saved.");
                setForm(createFeeItemForm());
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to save the fee item.");
              }
            }}
          >
            {saveFeeItemMutation.isPending ? "Saving..." : form.id ? "Update Fee Item" : "Add Fee Item"}
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Label" value={form.label} onChange={(label) => setForm({ ...form, label })} />
          <Field label="Code" value={form.code} onChange={(code) => setForm({ ...form, code })} />
          <NumberField label="Default Amount" value={form.defaultAmount} onChange={(defaultAmount) => setForm({ ...form, defaultAmount })} />
          <Field label="Currency" value={form.currency} onChange={(currency) => setForm({ ...form, currency: currency.toUpperCase() })} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_auto]">
          <TextAreaField label="Notes" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
          <NumberField label="Order" value={form.displayOrder} onChange={(displayOrder) => setForm({ ...form, displayOrder })} />
          <ToggleField label="Active" checked={form.isActive} onChange={(isActive) => setForm({ ...form, isActive })} />
        </div>
        <div className="mt-4 space-y-3">
          {(ledgerQuery.data?.feeItems ?? []).map((item) => (
            <div key={item.id} className="flex flex-wrap items-start justify-between gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <Badge variant={item.isActive ? "success" : "warning"}>{item.isActive ? "active" : "inactive"}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {item.code} · {item.currency} {item.defaultAmount.toLocaleString()}
                </p>
                {item.notes ? <p className="mt-2 text-sm text-slate-600">{item.notes}</p> : null}
              </div>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                onClick={() =>
                  setForm({
                    id: item.id,
                    label: item.label,
                    code: item.code,
                    defaultAmount: item.defaultAmount,
                    currency: item.currency,
                    notes: item.notes ?? "",
                    displayOrder: item.displayOrder,
                    isActive: item.isActive,
                  })
                }
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Commission Tracker" subtitle="Expected payouts are calculated when applications are marked enrolled and linked to a university commission rate.">
        <div className="space-y-3">
          {(ledgerQuery.data?.commissionPayouts ?? []).length === 0 ? (
            <EmptyHint message="No enrolled applications with commission payouts yet." />
          ) : (
            (ledgerQuery.data?.commissionPayouts ?? []).map((item) => (
              <div key={item.applicationId} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.clientName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.universityName} · {item.commissionPercentage}% of {item.basisAmount.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="dark">Expected {item.expectedPayout.toLocaleString()}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}

function LedgerStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-display font-extrabold text-slate-950">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" />
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
