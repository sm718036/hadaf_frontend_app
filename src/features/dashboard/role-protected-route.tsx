import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { SpinnerTwo } from "@/components/ui/spinner";
import { APP_ROUTES } from "@/config/routes";
import { useCurrentUser } from "@/features/auth/use-auth";
import { useCurrentClient } from "@/features/client-auth/use-client-auth";
import {
  canAccessInternalArea,
  getDefaultInternalDashboardRoute,
  type DashboardArea,
} from "@/features/dashboard/access-control";
import { useAppNavigate } from "@/lib/router";

export function RoleProtectedRoute({
  area,
  children,
}: {
  area: DashboardArea;
  children: ReactNode;
}) {
  const navigate = useAppNavigate();
  const location = useLocation();
  const currentUserQuery = useCurrentUser();
  const currentClientQuery = useCurrentClient();

  const isLoading = currentUserQuery.isLoading || currentClientQuery.isLoading;
  const currentUser = currentUserQuery.data;
  const currentClient = currentClientQuery.data;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (area === "client") {
      if (currentClient) {
        return;
      }

      if (currentUser) {
        navigate(getDefaultInternalDashboardRoute(currentUser), { replace: true });
        return;
      }

      navigate(APP_ROUTES.auth, {
        replace: true,
        search: { mode: "client", redirect: location.pathname },
      });
      return;
    }

    if (currentUser && canAccessInternalArea(currentUser, area)) {
      return;
    }

    if (currentClient) {
      navigate(APP_ROUTES.dashboardClient, { replace: true });
      return;
    }

    if (currentUser) {
      navigate(getDefaultInternalDashboardRoute(currentUser), { replace: true });
      return;
    }

    navigate(APP_ROUTES.auth, {
      replace: true,
      search: { redirect: location.pathname, mode: "staff" },
    });
  }, [area, currentClient, currentUser, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-slate-500">
        <SpinnerTwo size="lg" />
        <span className="text-sm font-medium">Loading dashboard...</span>
      </div>
    );
  }

  const isAllowed =
    area === "client"
      ? Boolean(currentClient)
      : Boolean(currentUser && canAccessInternalArea(currentUser, area));

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
