import type { ReactNode } from "react";
import type { Permission } from "@/features/auth/auth.schemas";
import { AuthGuard } from "@/features/auth/auth-guard";
import { PermissionGuard } from "@/features/auth/permission-guard";
import type { DashboardArea } from "@/features/dashboard/access-control";

export function ProtectedRoute({
  area,
  permissions,
  requireAdmin = false,
  children,
}: {
  area: DashboardArea;
  permissions?: Permission[];
  requireAdmin?: boolean;
  children: ReactNode;
}) {
  return (
    <AuthGuard area={area}>
      <PermissionGuard permissions={permissions} requireAdmin={requireAdmin}>
        {children}
      </PermissionGuard>
    </AuthGuard>
  );
}
