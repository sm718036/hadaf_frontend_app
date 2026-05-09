import { createFileRoute } from "@tanstack/react-router";
import { LeadListPage } from "@/features/leads/leads-ui";

export const Route = createFileRoute("/dashboard/staff/leads")({
  component: () => <LeadListPage area="staff" />,
});
