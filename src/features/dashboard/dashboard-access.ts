import type { SessionUser } from "@/features/auth/auth.service";
import { hasPermission } from "@/features/auth/permissions";

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
    canReadLeads: hasPermission(currentUser, "leads.read"),
    canWriteLeads: hasPermission(currentUser, "leads.write"),
    canReadClients: hasPermission(currentUser, "clients.read"),
    canWriteClients: hasPermission(currentUser, "clients.write"),
    canReadApplications: hasPermission(currentUser, "applications.read"),
    canWriteApplications: hasPermission(currentUser, "applications.write"),
    canReadTasks: hasPermission(currentUser, "tasks.read"),
    canWriteTasks: hasPermission(currentUser, "tasks.write"),
    canReadDocuments: hasPermission(currentUser, "documents.read"),
    canWriteDocuments: hasPermission(currentUser, "documents.write"),
    canReadAppointments: hasPermission(currentUser, "appointments.read"),
    canWriteAppointments: hasPermission(currentUser, "appointments.write"),
    canReadMessages: hasPermission(currentUser, "messages.read"),
    canWriteMessages: hasPermission(currentUser, "messages.write"),
    canReadPayments: hasPermission(currentUser, "payments.read"),
    canWritePayments: hasPermission(currentUser, "payments.write"),
    canReadSiteContent:
      hasPermission(currentUser, "site_content.read") ||
      hasPermission(currentUser, "site_content.write"),
    canWriteSiteContent: hasPermission(currentUser, "site_content.write"),
    canReadUsers: hasPermission(currentUser, "users.read"),
    canWriteUsers: hasPermission(currentUser, "users.write"),
  };
}
