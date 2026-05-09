import { createFileRoute } from "@tanstack/react-router";
import { ApplicationDetailPage } from "@/features/applications/applications-ui";

export const Route = createFileRoute("/dashboard/admin/applications/$applicationId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { applicationId } = Route.useParams();
  return <ApplicationDetailPage area="admin" applicationId={applicationId} />;
}
