import { createFileRoute } from "@tanstack/react-router";
import { LeadDetailPage } from "@/features/leads/leads-ui";

export const Route = createFileRoute("/dashboard/staff/leads/$leadId")({
  component: StaffLeadDetailRoute,
});

function StaffLeadDetailRoute() {
  const { leadId } = Route.useParams();
  return <LeadDetailPage area="staff" leadId={leadId} />;
}
