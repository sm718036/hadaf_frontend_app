import { createFileRoute } from "@tanstack/react-router";
import { LeadDetailPage } from "@/features/leads/leads-ui";

export const Route = createFileRoute("/dashboard/admin/leads/$leadId")({
  component: AdminLeadDetailRoute,
});

function AdminLeadDetailRoute() {
  const { leadId } = Route.useParams();
  return <LeadDetailPage area="admin" leadId={leadId} />;
}
