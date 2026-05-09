import { createFileRoute } from "@tanstack/react-router";
import { ApplicationListPage } from "@/features/applications/applications-ui";

export const Route = createFileRoute("/dashboard/staff/applications")({
  component: () => <ApplicationListPage area="staff" />,
});
