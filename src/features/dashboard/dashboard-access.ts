import type { SessionUser } from "@/features/auth/auth.service";

export type DashboardAccess = {
  currentUser: SessionUser;
  canReadLeads: boolean;
  canWriteLeads: boolean;
  canReadClients: boolean;
  canWriteClients: boolean;
  canReadApplications: boolean;
  canWriteApplications: boolean;
  canReadTasks: boolean;
  canWriteTasks: boolean;
  canReadDocuments: boolean;
  canWriteDocuments: boolean;
  canReadAppointments: boolean;
  canWriteAppointments: boolean;
  canReadMessages: boolean;
  canWriteMessages: boolean;
  canReadPayments: boolean;
  canWritePayments: boolean;
  canReadSiteContent: boolean;
  canWriteSiteContent: boolean;
  canReadUsers: boolean;
  canWriteUsers: boolean;
};

export function getDashboardAccess(currentUser: SessionUser): DashboardAccess {
  return {
    currentUser,
    canReadLeads: currentUser.role === "admin" || currentUser.permissions.includes("leads.read"),
    canWriteLeads: currentUser.role === "admin" || currentUser.permissions.includes("leads.write"),
    canReadClients:
      currentUser.role === "admin" || currentUser.permissions.includes("clients.read"),
    canWriteClients:
      currentUser.role === "admin" || currentUser.permissions.includes("clients.write"),
    canReadApplications:
      currentUser.role === "admin" || currentUser.permissions.includes("applications.read"),
    canWriteApplications:
      currentUser.role === "admin" || currentUser.permissions.includes("applications.write"),
    canReadTasks: currentUser.role === "admin" || currentUser.permissions.includes("tasks.read"),
    canWriteTasks: currentUser.role === "admin" || currentUser.permissions.includes("tasks.write"),
    canReadDocuments:
      currentUser.role === "admin" || currentUser.permissions.includes("documents.read"),
    canWriteDocuments:
      currentUser.role === "admin" || currentUser.permissions.includes("documents.write"),
    canReadAppointments:
      currentUser.role === "admin" || currentUser.permissions.includes("appointments.read"),
    canWriteAppointments:
      currentUser.role === "admin" || currentUser.permissions.includes("appointments.write"),
    canReadMessages:
      currentUser.role === "admin" || currentUser.permissions.includes("messages.read"),
    canWriteMessages:
      currentUser.role === "admin" || currentUser.permissions.includes("messages.write"),
    canReadPayments:
      currentUser.role === "admin" || currentUser.permissions.includes("payments.read"),
    canWritePayments:
      currentUser.role === "admin" || currentUser.permissions.includes("payments.write"),
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
