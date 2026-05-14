import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SelectMenu } from "@/components/ui/select-menu";
import { useDashboardAccess } from "@/features/dashboard/use-dashboard-access";
import { EmptyHint, Panel } from "@/features/dashboard/dashboard-ui";
import type { IntakeQuestion, UpsertIntakeQuestionInput } from "@/features/intake-engine/intake-engine.schemas";
import { useIntakeQuestions, usePublicLeadIntakeMetadata, useSaveIntakeQuestion } from "@/features/intake-engine/use-intake-engine";

function createEmptyQuestion(): UpsertIntakeQuestionInput {
  return {
    prompt: "",
    helpText: "",
    inputType: "single_select",
    countryConfigurationId: null,
    visaCategoryId: null,
    isRequired: true,
    displayOrder: 0,
    isActive: true,
    answerOptions: [
      { label: "", valueKey: "yes", weight: 0, isDisqualifying: false, displayOrder: 0, isActive: true },
      { label: "", valueKey: "no", weight: 0, isDisqualifying: false, displayOrder: 1, isActive: true },
    ],
  };
}

export function DashboardIntakeEnginePage() {
  const access = useDashboardAccess();
  const metadataQuery = usePublicLeadIntakeMetadata(access.currentUser.role === "admin");
  const questionsQuery = useIntakeQuestions(access.currentUser.role === "admin");
  const saveQuestionMutation = useSaveIntakeQuestion();
  const [form, setForm] = useState<UpsertIntakeQuestionInput>(createEmptyQuestion());

  const availableVisaCategories = useMemo(
    () =>
      (metadataQuery.data?.visaCategories ?? []).filter(
        (item) => item.countryId === form.countryConfigurationId,
      ),
    [metadataQuery.data?.visaCategories, form.countryConfigurationId],
  );

  if (access.currentUser.role !== "admin") {
    return <EmptyHint message="Only administrators can access the Intake Engine." tone="error" />;
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Lead & Intake Engine"
        subtitle="Manage qualification questions, weighted answers, and the intake rules used by public and internal lead capture."
        action={
          <button
            type="button"
            className="btn-gold"
            disabled={saveQuestionMutation.isPending}
            onClick={async () => {
              try {
                await saveQuestionMutation.mutateAsync(form);
                toast.success(form.id ? "Question updated." : "Question added.");
                setForm(createEmptyQuestion());
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to save the intake question.");
              }
            }}
          >
            {saveQuestionMutation.isPending ? "Saving..." : form.id ? "Update Question" : "Add Question"}
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <TextField label="Question Prompt" value={form.prompt} onChange={(prompt) => setForm({ ...form, prompt })} />
          <SelectField
            label="Input Type"
            value={form.inputType}
            onChange={(inputType) => setForm({ ...form, inputType: inputType as UpsertIntakeQuestionInput["inputType"] })}
            options={[
              { value: "single_select", label: "Single Select" },
              { value: "boolean", label: "Boolean" },
            ]}
          />
          <NumberField label="Display Order" value={form.displayOrder} onChange={(displayOrder) => setForm({ ...form, displayOrder })} />
          <SelectField
            label="Country Scope"
            value={form.countryConfigurationId ?? ""}
            onChange={(countryConfigurationId) =>
              setForm({ ...form, countryConfigurationId: countryConfigurationId || null, visaCategoryId: null })
            }
            options={[
              { value: "", label: "All countries" },
              ...(metadataQuery.data?.countries ?? []).map((country) => ({ value: country.id, label: country.name })),
            ]}
          />
          <SelectField
            label="Visa Scope"
            value={form.visaCategoryId ?? ""}
            onChange={(visaCategoryId) => setForm({ ...form, visaCategoryId: visaCategoryId || null })}
            options={[
              { value: "", label: "All visa categories" },
              ...availableVisaCategories.map((category) => ({ value: category.id, label: `${category.code} · ${category.name}` })),
            ]}
          />
          <ToggleField label="Required question" checked={form.isRequired} onChange={(isRequired) => setForm({ ...form, isRequired })} />
        </div>
        <div className="mt-4">
          <TextAreaField label="Help Text" value={form.helpText} onChange={(helpText) => setForm({ ...form, helpText })} />
        </div>
        <div className="mt-6 grid gap-3">
          {form.answerOptions.map((option, index) => (
            <div key={option.id ?? index} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 xl:grid-cols-6">
              <TextField
                label={`Answer ${index + 1}`}
                value={option.label}
                onChange={(label) =>
                  setForm({
                    ...form,
                    answerOptions: form.answerOptions.map((item, itemIndex) => (itemIndex === index ? { ...item, label } : item)),
                  })
                }
              />
              <TextField
                label="Value Key"
                value={option.valueKey}
                onChange={(valueKey) =>
                  setForm({
                    ...form,
                    answerOptions: form.answerOptions.map((item, itemIndex) => (itemIndex === index ? { ...item, valueKey } : item)),
                  })
                }
              />
              <NumberField
                label="Weight"
                value={option.weight}
                onChange={(weight) =>
                  setForm({
                    ...form,
                    answerOptions: form.answerOptions.map((item, itemIndex) => (itemIndex === index ? { ...item, weight } : item)),
                  })
                }
              />
              <NumberField
                label="Order"
                value={option.displayOrder}
                onChange={(displayOrder) =>
                  setForm({
                    ...form,
                    answerOptions: form.answerOptions.map((item, itemIndex) => (itemIndex === index ? { ...item, displayOrder } : item)),
                  })
                }
              />
              <ToggleField
                label="Active"
                checked={option.isActive}
                onChange={(isActive) =>
                  setForm({
                    ...form,
                    answerOptions: form.answerOptions.map((item, itemIndex) => (itemIndex === index ? { ...item, isActive } : item)),
                  })
                }
              />
              <ToggleField
                label="Disqualifying"
                checked={option.isDisqualifying}
                onChange={(isDisqualifying) =>
                  setForm({
                    ...form,
                    answerOptions: form.answerOptions.map((item, itemIndex) => (itemIndex === index ? { ...item, isDisqualifying } : item)),
                  })
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            onClick={() =>
              setForm({
                ...form,
                answerOptions: [
                  ...form.answerOptions,
                  {
                    label: "",
                    valueKey: `option_${form.answerOptions.length + 1}`,
                    weight: 0,
                    isDisqualifying: false,
                    displayOrder: form.answerOptions.length,
                    isActive: true,
                  },
                ],
              })
            }
          >
            Add Answer Option
          </button>
        </div>
      </Panel>

      <Panel title="Question Library" subtitle="Review active and inactive qualification rules and edit them in place.">
        {questionsQuery.isLoading ? (
          <EmptyHint message="Loading intake questions..." loading />
        ) : questionsQuery.isError ? (
          <EmptyHint message="Unable to load intake questions." tone="error" />
        ) : (questionsQuery.data?.length ?? 0) === 0 ? (
          <EmptyHint message="No intake questions configured yet." />
        ) : (
          <div className="space-y-4">
            {(questionsQuery.data ?? []).map((question) => (
              <QuestionCard key={question.id} question={question} onEdit={() => setForm(mapQuestionToForm(question))} />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function QuestionCard({ question, onEdit }: { question: IntakeQuestion; onEdit: () => void }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">{question.prompt}</p>
            <Badge variant={question.isActive ? "success" : "warning"}>{question.isActive ? "active" : "inactive"}</Badge>
            {question.isRequired ? <Badge variant="dark">required</Badge> : null}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {question.countryName ?? "All countries"} · {question.visaCategoryName ?? "All visa categories"}
          </p>
          {question.helpText ? <p className="mt-2 text-sm text-slate-600">{question.helpText}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {question.answerOptions.map((option) => (
              <Badge key={option.id} variant={option.weight >= 0 ? "success" : "warning"}>
                {option.label} {option.weight >= 0 ? `+${option.weight}` : option.weight}
              </Badge>
            ))}
          </div>
        </div>
        <button type="button" onClick={onEdit} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
          Edit
        </button>
      </div>
    </div>
  );
}

function mapQuestionToForm(question: IntakeQuestion): UpsertIntakeQuestionInput {
  return {
    id: question.id,
    prompt: question.prompt,
    helpText: question.helpText ?? "",
    inputType: question.inputType,
    countryConfigurationId: question.countryConfigurationId,
    visaCategoryId: question.visaCategoryId,
    isRequired: question.isRequired,
    displayOrder: question.displayOrder,
    isActive: question.isActive,
    answerOptions: question.answerOptions.map((option) => ({
      id: option.id,
      label: option.label,
      valueKey: option.valueKey,
      weight: option.weight,
      isDisqualifying: option.isDisqualifying,
      displayOrder: option.displayOrder,
      isActive: option.isActive,
    })),
  };
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300" />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-300" />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value || 0))} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-300" />
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

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex h-12 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <Badge variant={checked ? "success" : "warning"}>{checked ? "On" : "Off"}</Badge>
    </button>
  );
}
