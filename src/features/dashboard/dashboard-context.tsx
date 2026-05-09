import { createContext, useContext } from "react";
import type { SessionUser } from "@/features/auth/auth.service";

export type DashboardAccess = {
  currentUser: SessionUser;
  canReadLeads: boolean;
  canWriteLeads: boolean;
  canReadClients: boolean;
  canWriteClients: boolean;
  canReadApplications: boolean;
  canWriteApplications: boolean;
  canReadSiteContent: boolean;
  canWriteSiteContent: boolean;
  canReadUsers: boolean;
  canWriteUsers: boolean;
};

const DashboardContext = createContext<DashboardAccess | null>(null);

export function getDashboardAccess(currentUser: SessionUser): DashboardAccess {
  return {
    currentUser,
    canReadLeads: currentUser.role === "admin" || currentUser.permissions.includes("leads.read"),
    canWriteLeads: currentUser.role === "admin" || currentUser.permissions.includes("leads.write"),
    canReadClients: currentUser.role === "admin" || currentUser.permissions.includes("clients.read"),
    canWriteClients:
      currentUser.role === "admin" || currentUser.permissions.includes("clients.write"),
    canReadApplications:
      currentUser.role === "admin" || currentUser.permissions.includes("applications.read"),
    canWriteApplications:
      currentUser.role === "admin" || currentUser.permissions.includes("applications.write"),
    canReadSiteContent:
      currentUser.role === "admin" ||
      currentUser.permissions.includes("site_content.read") ||
      currentUser.permissions.includes("site_content.write"),
    canWriteSiteContent:
      currentUser.role === "admin" || currentUser.permissions.includes("site_content.write"),
    canReadUsers: currentUser.role === "admin" || currentUser.permissions.includes("users.read"),
    canWriteUsers: currentUser.role === "admin" || currentUser.permissions.includes("users.write"),
  };
}

export function DashboardProvider({
  value,
  children,
}: {
  value: DashboardAccess;
  children: React.ReactNode;
}) {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardAccess() {
  const value = useContext(DashboardContext);

  if (!value) {
    throw new Error("useDashboardAccess must be used within a DashboardProvider.");
  }

  return value;
}
