import { createFileRoute } from "@tanstack/react-router";
import { ClientListPage } from "@/features/clients/client-ui";

export const Route = createFileRoute("/dashboard/admin/clients")({
  component: () => <ClientListPage area="admin" />,
});
