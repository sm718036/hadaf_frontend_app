import type { Permission } from "@/features/auth/auth.schemas";
import type { SessionUser } from "@/features/auth/auth.service";

export function hasPermission(user: SessionUser, permission: Permission) {
  return user.role === "admin" || user.permissions.includes(permission);
}

export function hasAnyPermission(user: SessionUser, permissions: Permission[]) {
  return (
    user.role === "admin" || permissions.some((permission) => user.permissions.includes(permission))
  );
}

export function hasAllPermissions(user: SessionUser, permissions: Permission[]) {
  return (
    user.role === "admin" ||
    permissions.every((permission) => user.permissions.includes(permission))
  );
}
