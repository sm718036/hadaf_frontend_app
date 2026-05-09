import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { APP_ROUTES } from "@/config/routes";
import { useCurrentUser } from "@/features/auth/use-auth";
import { getDefaultInternalDashboardRoute } from "@/features/dashboard/access-control";

export const Route = createFileRoute("/dashboard/clients")({
  component: DashboardClientsRedirect,
});

function DashboardClientsRedirect() {
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!currentUser) {
      navigate({ to: APP_ROUTES.auth, search: { redirect: APP_ROUTES.dashboardClients, mode: "staff" }, replace: true });
      return;
    }

    navigate({
      to: currentUser.role === "admin" ? APP_ROUTES.dashboardAdminClients : APP_ROUTES.dashboardStaffClients,
      replace: true,
    });
  }, [currentUser, isLoading, navigate]);

  return null;
}
