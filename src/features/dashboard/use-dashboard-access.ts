import { useContext } from "react";
import { DashboardContext } from "@/features/dashboard/dashboard-context-instance";

export function useDashboardAccess() {
  const value = useContext(DashboardContext);

  if (!value) {
    throw new Error("useDashboardAccess must be used within a DashboardProvider.");
  }

  return value;
}

export function useOptionalDashboardAccess() {
  return useContext(DashboardContext);
}
