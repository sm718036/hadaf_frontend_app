import type { ReactNode } from "react";
import type { DashboardAccess } from "@/features/dashboard/dashboard-access";
import { DashboardContext } from "@/features/dashboard/dashboard-context-instance";

export function DashboardProvider({
  value,
  children,
}: {
  value: DashboardAccess;
  children: ReactNode;
}) {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
