import { createFileRoute } from "@tanstack/react-router";
import { ClientDetailPage } from "@/features/clients/client-ui";

export const Route = createFileRoute("/dashboard/staff/clients/$clientId")({
  component: StaffClientDetailRoute,
});

function StaffClientDetailRoute() {
  const { clientId } = Route.useParams();
  return <ClientDetailPage area="staff" clientId={clientId} />;
}
