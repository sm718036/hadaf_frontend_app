import { createFileRoute } from "@tanstack/react-router";
import { useCurrentClient } from "@/features/client-auth/use-client-auth";
import { ClientOverviewPage } from "@/features/dashboard/module-pages";

export const Route = createFileRoute("/dashboard/client/")({
  component: ClientDashboardOverview,
});

function ClientDashboardOverview() {
  const { data: currentClient } = useCurrentClient();

  if (!currentClient) {
    return null;
  }

  return <ClientOverviewPage client={currentClient} />;
}
