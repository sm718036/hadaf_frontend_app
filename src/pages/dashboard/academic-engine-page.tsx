import type { ReactNode } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SelectMenu } from "@/components/ui/select-menu";
import { useApplications } from "@/features/applications/use-applications";
import type {
  UpsertPartnerCampusInput,
  UpsertPartnerCourseInput,
  UpsertPartnerUniversityInput,
} from "@/features/academic-engine/academic-engine.schemas";
import {
  useAcademicEngine,
  useSavePartnerCampus,
  useSavePartnerCourse,
  useSavePartnerUniversity,
} from "@/features/academic-engine/use-academic-engine";
import { useConfigurationVaultMetadata } from "@/features/configuration-vault/use-configuration-vault";
import { useDashboardAccess } from "@/features/dashboard/use-dashboard-access";
import { EmptyHint, Panel } from "@/features/dashboard/dashboard-ui";

function createUniversityForm(): UpsertPartnerUniversityInput {
  return { countryId: "", name: "", websiteUrl: "", commissionPercentage: 0, notes: "", displayOrder: 0, isActive: true };
}

function createCampusForm(): UpsertPartnerCampusInput {
  return { universityId: "", name: "", city: "", notes: "", displayOrder: 0, isActive: true };
}

function createCourseForm(): UpsertPartnerCourseInput {
  return {
    campusId: "",
    visaCategoryId: null,
    name: "",
    awardLevel: "",
    ieltsFloor: null,
    gpaFloor: null,
    notes: "",
    displayOrder: 0,
    isActive: true,
  };
}

const STAGES = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "cas_coe", label: "CAS / COE" },
] as const;

export function DashboardAcademicEnginePage() {
  const access = useDashboardAccess();
  const academicQuery = useAcademicEngine(access.currentUser.role === "admin");
  const vaultMetadataQuery = useConfigurationVaultMetadata(access.currentUser.role === "admin");
  const applicationsQuery = useApplications({
    enabled: access.canReadApplications,
    page: 1,
    pageSize: 100,
    search: "",
  });
  const saveUniversityMutation = useSavePartnerUniversity();
  const saveCampusMutation = useSavePartnerCampus();
  const saveCourseMutation = useSavePartnerCourse();
  const [universityForm, setUniversityForm] = useState(createUniversityForm());
  const [campusForm, setCampusForm] = useState(createCampusForm());
  const [courseForm, setCourseForm] = useState(createCourseForm());

  const universities = academicQuery.data?.universities ?? [];
  const campuses = academicQuery.data?.campuses ?? [];
  const courses = academicQuery.data?.courses ?? [];

  const selectedCampus = campuses.find((item) => item.id === courseForm.campusId);
  const visaCategories = (vaultMetadataQuery.data?.visaCategories ?? []).filter(
    (item) => !selectedCampus || item.countryId === selectedCampus.countryId,
  );

  if (access.currentUser.role !== "admin") {
    return <EmptyHint message="Only administrators can access the Academic Engine." tone="error" />;
  }

  const stageColumns = STAGES.map((stage) => ({
    ...stage,
    items: (applicationsQuery.data?.items ?? []).filter((item) => item.academicStage === stage.value),
  }));

  return (
    <div className="space-y-6">
      <Panel
        title="Academic & University Application Engine"
        subtitle="Manage partner universities, campuses, course requirements, and track academic applications through a staff-updated board."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <VaultStat label="Universities" value={universities.length} />
          <VaultStat label="Campuses" value={campuses.length} />
          <VaultStat label="Courses" value={courses.length} />
        </div>
      </Panel>

      <Panel
        title="Partner Universities"
        subtitle="Create the university inventory by destination country."
        action={<SaveButton pending={saveUniversityMutation.isPending} label={universityForm.id ? "Update University" : "Add University"} onClick={async () => {
          try {
            await saveUniversityMutation.mutateAsync(universityForm);
            toast.success("University saved.");
            setUniversityForm(createUniversityForm());
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save the university.");
          }
        }} />}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Country"
            value={universityForm.countryId}
            onChange={(countryId) => setUniversityForm({ ...universityForm, countryId })}
            options={(vaultMetadataQuery.data?.countries ?? []).map((item) => ({ value: item.id, label: item.name }))}
          />
          <TextField label="University" value={universityForm.name} onChange={(name) => setUniversityForm({ ...universityForm, name })} />
          <TextField label="Website" value={universityForm.websiteUrl} onChange={(websiteUrl) => setUniversityForm({ ...universityForm, websiteUrl })} />
          <NumberField label="Commission %" value={universityForm.commissionPercentage} onChange={(commissionPercentage) => setUniversityForm({ ...universityForm, commissionPercentage })} />
          <NumberField label="Order" value={universityForm.displayOrder} onChange={(displayOrder) => setUniversityForm({ ...universityForm, displayOrder })} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
          <TextAreaField label="Notes" value={universityForm.notes} onChange={(notes) => setUniversityForm({ ...universityForm, notes })} />
          <ToggleField label="Active" checked={universityForm.isActive} onChange={(isActive) => setUniversityForm({ ...universityForm, isActive })} />
        </div>
        <SimpleList
          items={universities}
          renderItem={(item) => (
            <EditableRow
              key={item.id}
              title={item.name}
              subtitle={item.countryName}
              meta={item.websiteUrl || "No website"}
              isActive={item.isActive}
              onEdit={() => setUniversityForm({
                id: item.id,
                countryId: item.countryId,
                name: item.name,
                websiteUrl: item.websiteUrl ?? "",
                commissionPercentage: item.commissionPercentage,
                notes: item.notes ?? "",
                displayOrder: item.displayOrder,
                isActive: item.isActive,
              })}
            />
          )}
        />
      </Panel>

      <Panel
        title="Campuses"
        subtitle="Attach campuses to partner universities."
        action={<SaveButton pending={saveCampusMutation.isPending} label={campusForm.id ? "Update Campus" : "Add Campus"} onClick={async () => {
          try {
            await saveCampusMutation.mutateAsync(campusForm);
            toast.success("Campus saved.");
            setCampusForm(createCampusForm());
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save the campus.");
          }
        }} />}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="University"
            value={campusForm.universityId}
            onChange={(universityId) => setCampusForm({ ...campusForm, universityId })}
            options={universities.map((item) => ({ value: item.id, label: item.name }))}
          />
          <TextField label="Campus" value={campusForm.name} onChange={(name) => setCampusForm({ ...campusForm, name })} />
          <TextField label="City" value={campusForm.city} onChange={(city) => setCampusForm({ ...campusForm, city })} />
          <NumberField label="Order" value={campusForm.displayOrder} onChange={(displayOrder) => setCampusForm({ ...campusForm, displayOrder })} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
          <TextAreaField label="Notes" value={campusForm.notes} onChange={(notes) => setCampusForm({ ...campusForm, notes })} />
          <ToggleField label="Active" checked={campusForm.isActive} onChange={(isActive) => setCampusForm({ ...campusForm, isActive })} />
        </div>
        <SimpleList
          items={campuses}
          renderItem={(item) => (
            <EditableRow
              key={item.id}
              title={item.name}
              subtitle={`${item.universityName}${item.city ? ` · ${item.city}` : ""}`}
              meta={`Order ${item.displayOrder}`}
              isActive={item.isActive}
              onEdit={() => setCampusForm({
                id: item.id,
                universityId: item.universityId,
                name: item.name,
                city: item.city ?? "",
                notes: item.notes ?? "",
                displayOrder: item.displayOrder,
                isActive: item.isActive,
              })}
            />
          )}
        />
      </Panel>

      <Panel
        title="Course Requirements"
        subtitle="Map IELTS and GPA floors at the course level."
        action={<SaveButton pending={saveCourseMutation.isPending} label={courseForm.id ? "Update Course" : "Add Course"} onClick={async () => {
          try {
            await saveCourseMutation.mutateAsync(courseForm);
            toast.success("Course saved.");
            setCourseForm(createCourseForm());
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Unable to save the course.");
          }
        }} />}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Campus"
            value={courseForm.campusId}
            onChange={(campusId) => setCourseForm({ ...courseForm, campusId, visaCategoryId: null })}
            options={campuses.map((item) => ({ value: item.id, label: `${item.universityName} · ${item.name}` }))}
          />
          <SelectField
            label="Visa Scope"
            value={courseForm.visaCategoryId ?? ""}
            onChange={(visaCategoryId) => setCourseForm({ ...courseForm, visaCategoryId: visaCategoryId || null })}
            options={[{ value: "", label: "Any visa type" }, ...visaCategories.map((item) => ({ value: item.id, label: `${item.code} · ${item.name}` }))]}
          />
          <TextField label="Course Name" value={courseForm.name} onChange={(name) => setCourseForm({ ...courseForm, name })} />
          <TextField label="Award Level" value={courseForm.awardLevel} onChange={(awardLevel) => setCourseForm({ ...courseForm, awardLevel })} />
          <DecimalField label="IELTS Floor" value={courseForm.ieltsFloor} onChange={(ieltsFloor) => setCourseForm({ ...courseForm, ieltsFloor })} />
          <DecimalField label="GPA Floor" value={courseForm.gpaFloor} onChange={(gpaFloor) => setCourseForm({ ...courseForm, gpaFloor })} />
          <NumberField label="Order" value={courseForm.displayOrder} onChange={(displayOrder) => setCourseForm({ ...courseForm, displayOrder })} />
          <ToggleField label="Active" checked={courseForm.isActive} onChange={(isActive) => setCourseForm({ ...courseForm, isActive })} />
        </div>
        <div className="mt-4">
          <TextAreaField label="Notes" value={courseForm.notes} onChange={(notes) => setCourseForm({ ...courseForm, notes })} />
        </div>
        <SimpleList
          items={courses}
          renderItem={(item) => (
            <EditableRow
              key={item.id}
              title={item.name}
              subtitle={`${item.universityName} · ${item.campusName}`}
              meta={`IELTS ${item.ieltsFloor ?? "—"} · GPA ${item.gpaFloor ?? "—"}`}
              isActive={item.isActive}
              onEdit={() => setCourseForm({
                id: item.id,
                campusId: item.campusId,
                visaCategoryId: item.visaCategoryId,
                name: item.name,
                awardLevel: item.awardLevel ?? "",
                ieltsFloor: item.ieltsFloor,
                gpaFloor: item.gpaFloor,
                notes: item.notes ?? "",
                displayOrder: item.displayOrder,
                isActive: item.isActive,
              })}
            />
          )}
        />
      </Panel>

      <Panel title="Application Tracker" subtitle="A kanban view of academic-stage progress. Staff update the stage from each application record.">
        <div className="grid gap-4 xl:grid-cols-4">
          {stageColumns.map((column) => (
            <div key={column.value} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900">{column.label}</h3>
                <Badge variant="light">{column.items.length}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {column.items.length === 0 ? (
                  <p className="text-sm text-slate-500">No applications in this stage.</p>
                ) : (
                  column.items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="font-semibold text-slate-900">{item.clientName}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.partnerUniversityName || item.universityProgram || item.targetCountry}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{item.serviceType}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function VaultStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-display font-extrabold text-slate-950">{value}</div>
    </div>
  );
}

function SaveButton({ label, pending, onClick }: { label: string; pending: boolean; onClick: () => void }) {
  return (
    <button type="button" className="btn-gold" disabled={pending} onClick={onClick}>
      {pending ? "Saving..." : label}
    </button>
  );
}

function SimpleList<T>({ items, renderItem }: { items: T[]; renderItem: (item: T) => ReactNode }) {
  if (items.length === 0) {
    return <div className="mt-4 text-sm text-slate-500">No records yet.</div>;
  }

  return <div className="mt-4 space-y-3">{items.map(renderItem)}</div>;
}

function EditableRow({
  title,
  subtitle,
  meta,
  isActive,
  onEdit,
}: {
  title: string;
  subtitle: string;
  meta: string;
  isActive: boolean;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        <p className="mt-1 text-xs text-slate-400">{meta}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={isActive ? "success" : "warning"}>{isActive ? "active" : "inactive"}</Badge>
        <button type="button" className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700" onClick={onEdit}>
          Edit
        </button>
      </div>
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

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" />
    </label>
  );
}

function DecimalField({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number | null) => void }) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <input type="number" step="0.1" value={value ?? ""} onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none" />
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
