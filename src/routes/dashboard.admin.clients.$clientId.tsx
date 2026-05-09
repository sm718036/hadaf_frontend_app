import { createFileRoute } from "@tanstack/react-router";
import { ClientDetailPage } from "@/features/clients/client-ui";

export const Route = createFileRoute("/dashboard/admin/clients/$clientId")({
  component: AdminClientDetailRoute,
});

function AdminClientDetailRoute() {
  const { clientId } = Route.useParams();
  return <ClientDetailPage area="admin" clientId={clientId} />;
}
