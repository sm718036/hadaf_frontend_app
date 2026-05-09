import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { APP_ROUTES } from "@/config/routes";
import { useCurrentClient } from "@/features/client-auth/use-client-auth";

export const Route = createFileRoute("/client-portal")({
  head: () => ({
    meta: [
      { title: "Client Portal - Hadaf" },
      { name: "description", content: "View your Hadaf client profile." },
    ],
  }),
  component: ClientPortalRedirect,
});

function ClientPortalRedirect() {
  const navigate = useNavigate();
  const { data: client, isLoading } = useCurrentClient();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    navigate({
      to: client ? APP_ROUTES.dashboardClient : APP_ROUTES.auth,
      search: client ? undefined : { mode: "client", redirect: APP_ROUTES.dashboardClient },
      replace: true,
    });
  }, [client, isLoading, navigate]);

  return null;
}
