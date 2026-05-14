import type { ClientSessionUser } from "@/features/client-auth/client-auth.service";
import { StatusBadge } from "@/features/dashboard/dashboard-layout";
import { Panel } from "@/features/dashboard/dashboard-ui";

export function ModuleOverview({ title, description }: { title: string; description: string }) {
  return (
    <Panel title={title} subtitle={description}>
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
        Access to this workspace is controlled by role and permission. Available modules appear in
        the dashboard navigation.
      </div>
    </Panel>
  );
}

export function PlaceholderModulePage({
  title,
  description,
  resourceLabel,
}: {
  title: string;
  description: string;
  resourceLabel: string;
}) {
  return (
    <Panel
      title={title}
      subtitle={description}
      action={<StatusBadge tone="info">Coming next</StatusBadge>}
    >
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-7 text-slate-600">
        {resourceLabel} is part of the dashboard structure and will appear here once its data flow
        is connected.
      </div>
    </Panel>
  );
}

export function ClientOverviewPage({ client }: { client: ClientSessionUser }) {
  return (
    <Panel
      title="Client Summary"
      subtitle="This dashboard is limited to your own Hadaf profile, application, documents, appointments, payments, and messages."
      action={<StatusBadge tone="success">Secure portal</StatusBadge>}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <OverviewField label="Name" value={client.name} />
        <OverviewField label="Email" value={client.email} />
        <OverviewField
          label="Country of Residence"
          value={client.countryOfResidence || "Not provided"}
        />
        <OverviewField label="Target Country" value={client.targetCountry || "Not provided"} />
      </div>
    </Panel>
  );
}

function OverviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
