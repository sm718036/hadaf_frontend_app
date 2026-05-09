import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  CalendarDays,
  FileCheck2,
  FileJson2,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  ReceiptText,
  ShieldUser,
  SquareUserRound,
  UserCog,
  UsersRound,
} from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import type { SessionUser } from "@/features/auth/auth.service";
import type { Permission, UserRole } from "@/features/auth/auth.schemas";

export type DashboardArea = "admin" | "staff" | "client";

export type DashboardNavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  permission?: Permission;
};

function hasPermission(user: SessionUser, permission: Permission) {
  return user.role === "admin" || user.permissions.includes(permission);
}

export function getDefaultInternalDashboardRoute(user: SessionUser) {
  return user.role === "admin" ? APP_ROUTES.dashboardAdmin : APP_ROUTES.dashboardStaff;
}

export function canAccessInternalArea(user: SessionUser, area: Exclude<DashboardArea, "client">) {
  if (user.role === "admin") {
    return true;
  }

  return area === "staff";
}

export function getAllowedInternalNavItems(user: SessionUser, area: Exclude<DashboardArea, "client">) {
  const items = area === "admin" ? ADMIN_NAV_ITEMS : STAFF_NAV_ITEMS;

  return items.filter((item) => !item.permission || hasPermission(user, item.permission));
}

export function getRoleLabel(role: UserRole) {
  return role === "admin" ? "Administrator" : "Staff Member";
}

const ADMIN_NAV_ITEMS: DashboardNavItem[] = [
  { label: "Overview", to: APP_ROUTES.dashboardAdmin, icon: LayoutDashboard },
  { label: "Leads", to: APP_ROUTES.dashboardAdminLeads, icon: UsersRound, permission: "leads.read" },
  { label: "Clients", to: APP_ROUTES.dashboardAdminClients, icon: BriefcaseBusiness, permission: "clients.read" },
  { label: "Applications", to: APP_ROUTES.dashboardAdminApplications, icon: FileCheck2, permission: "applications.read" },
  { label: "Landing CMS", to: APP_ROUTES.dashboardAdminContent, icon: FileJson2, permission: "site_content.read" },
  { label: "User Access", to: APP_ROUTES.dashboardAdminUsers, icon: UserCog, permission: "users.read" },
  { label: "Profile", to: APP_ROUTES.dashboardAdminProfile, icon: SquareUserRound },
];

const STAFF_NAV_ITEMS: DashboardNavItem[] = [
  { label: "Overview", to: APP_ROUTES.dashboardStaff, icon: LayoutDashboard },
  { label: "Leads", to: APP_ROUTES.dashboardStaffLeads, icon: UsersRound, permission: "leads.read" },
  { label: "Clients", to: APP_ROUTES.dashboardStaffClients, icon: BriefcaseBusiness, permission: "clients.read" },
  { label: "Applications", to: APP_ROUTES.dashboardStaffApplications, icon: FileCheck2, permission: "applications.read" },
  { label: "Tasks", to: APP_ROUTES.dashboardStaffTasks, icon: FolderKanban, permission: "tasks.read" },
  { label: "Documents", to: APP_ROUTES.dashboardStaffDocuments, icon: FileJson2, permission: "documents.read" },
  { label: "Appointments", to: APP_ROUTES.dashboardStaffAppointments, icon: CalendarDays, permission: "appointments.read" },
  { label: "Messages", to: APP_ROUTES.dashboardStaffMessages, icon: MessageSquareText, permission: "messages.read" },
  { label: "Profile", to: APP_ROUTES.dashboardStaffProfile, icon: SquareUserRound },
];

export const CLIENT_NAV_ITEMS: DashboardNavItem[] = [
  { label: "Overview", to: APP_ROUTES.dashboardClient, icon: LayoutDashboard },
  { label: "Profile", to: APP_ROUTES.dashboardClientProfile, icon: SquareUserRound },
  { label: "Application", to: APP_ROUTES.dashboardClientApplication, icon: FileCheck2 },
  { label: "Documents", to: APP_ROUTES.dashboardClientDocuments, icon: FileJson2 },
  { label: "Appointments", to: APP_ROUTES.dashboardClientAppointments, icon: CalendarDays },
  { label: "Payments", to: APP_ROUTES.dashboardClientPayments, icon: ReceiptText },
  { label: "Messages", to: APP_ROUTES.dashboardClientMessages, icon: MessageSquareText },
];

export const AREA_META: Record<DashboardArea, { eyebrow: string; accentLabel: string; icon: LucideIcon }> = {
  admin: {
    eyebrow: "Admin Dashboard",
    accentLabel: "Portal",
    icon: ShieldUser,
  },
  staff: {
    eyebrow: "Counselor Dashboard",
    accentLabel: "Team",
    icon: UsersRound,
  },
  client: {
    eyebrow: "Client Dashboard",
    accentLabel: "Client",
    icon: SquareUserRound,
  },
};
