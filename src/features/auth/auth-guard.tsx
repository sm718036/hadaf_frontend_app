import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { SpinnerTwo } from "@/components/ui/spinner";
import { APP_ROUTES } from "@/config/routes";
import {
  getDefaultInternalDashboardRoute,
  type DashboardArea,
} from "@/features/dashboard/access-control";
import { useCurrentUser } from "@/features/auth/use-auth";
import { useCurrentClient } from "@/features/client-auth/use-client-auth";

export function AuthGuard({ area, children }: { area: DashboardArea; children: ReactNode }) {
  const location = useLocation();
  const currentUserQuery = useCurrentUser();
  const currentClientQuery = useCurrentClient();

  if (currentUserQuery.isLoading || currentClientQuery.isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/60 text-slate-500 backdrop-blur-[2px]">
        <SpinnerTwo size="lg" />
        <span className="text-sm font-medium">Loading dashboard...</span>
      </div>
    );
  }

  const currentUser = currentUserQuery.data;
  const currentClient = currentClientQuery.data;

  if (area === "client") {
    if (currentClient) {
      return <>{children}</>;
    }

    if (currentUser) {
      return <Navigate to={getDefaultInternalDashboardRoute(currentUser)} replace />;
    }

    return (
      <Navigate
        to={`${APP_ROUTES.auth}?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (currentUser) {
    if (area === "admin" && currentUser.role !== "admin") {
      return <Navigate to={getDefaultInternalDashboardRoute(currentUser)} replace />;
    }

    return <>{children}</>;
  }

  if (currentClient) {
    return <Navigate to={APP_ROUTES.dashboardClient} replace />;
  }

  return (
    <Navigate to={`${APP_ROUTES.auth}?redirect=${encodeURIComponent(location.pathname)}`} replace />
  );
}
