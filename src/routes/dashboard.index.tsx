import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { APP_ROUTES } from "@/config/routes";
import { useCurrentUser } from "@/features/auth/use-auth";
import { useCurrentClient } from "@/features/client-auth/use-client-auth";
import { getDefaultInternalDashboardRoute } from "@/features/dashboard/access-control";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndexRedirect,
});

function DashboardIndexRedirect() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const { data: currentClient, isLoading: isLoadingClient } = useCurrentClient();

  useEffect(() => {
    if (isLoadingUser || isLoadingClient) {
      return;
    }

    if (currentUser) {
      navigate({ to: getDefaultInternalDashboardRoute(currentUser), replace: true });
      return;
    }

    if (currentClient) {
      navigate({ to: APP_ROUTES.dashboardClient, replace: true });
      return;
    }

    navigate({ to: APP_ROUTES.auth, search: { mode: "staff", redirect: APP_ROUTES.dashboard }, replace: true });
  }, [currentClient, currentUser, isLoadingClient, isLoadingUser, navigate]);

  return null;
}
