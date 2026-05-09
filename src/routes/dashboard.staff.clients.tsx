import { createFileRoute } from "@tanstack/react-router";
import { ClientListPage } from "@/features/clients/client-ui";

export const Route = createFileRoute("/dashboard/staff/clients")({
  component: () => <ClientListPage area="staff" />,
});
