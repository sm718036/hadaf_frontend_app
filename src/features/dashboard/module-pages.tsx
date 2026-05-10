import { Badge } from "@/components/ui/badge";
import type { ClientSessionUser } from "@/features/client-auth/client-auth.service";
import { DataTable, StatusBadge } from "@/features/dashboard/dashboard-layout";
import { Panel } from "@/features/dashboard/dashboard-ui";

export function ModuleOverview({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Panel
      title={title}
      subtitle={description}
      action={<StatusBadge tone="success">Portal ready</StatusBadge>}
    >
      <DataTable
        columns={["Focus", "Status"]}
        rows={[
          ["Leads, clients, and applications", <Badge variant="success">Active</Badge>],
          ["Tasks, documents, appointments, messages, payments", <Badge variant="success">Active</Badge>],
          ["Landing content and user access", <Badge variant="success">Active</Badge>],
        ]}
        emptyMessage="No modules available."
      />
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
    <Panel title={title} subtitle={description} action={<StatusBadge tone="info">Coming next</StatusBadge>}>
      <DataTable
        columns={["Resource", "Scope", "Permission", "Status"]}
        rows={[
          [
            <span className="font-semibold text-slate-900">{resourceLabel}</span>,
            "Role-limited",
            <Badge variant="light">Backend enforced</Badge>,
            <StatusBadge tone="warning">Pending data integration</StatusBadge>,
          ],
        ]}
        emptyMessage="No records available."
      />
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
      <DataTable
        columns={["Field", "Value", "Scope"]}
        rows={[
          ["Name", client.name, "Your profile"],
          ["Email", client.email, "Your profile"],
          ["Country of Residence", client.countryOfResidence || "Not provided", "Your profile"],
          ["Target Country", client.targetCountry || "Not provided", "Your application"],
        ]}
        emptyMessage="No profile fields available."
      />
    </Panel>
  );
}
