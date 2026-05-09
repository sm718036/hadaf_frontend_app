import { createFileRoute } from "@tanstack/react-router";
import { ApplicationListPage } from "@/features/applications/applications-ui";

export const Route = createFileRoute("/dashboard/admin/applications")({
  component: () => <ApplicationListPage area="admin" />,
});
