import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Permission } from "@/features/auth/auth.schemas";
import { hasAllPermissions } from "@/features/auth/permissions";
import { useCurrentUser } from "@/features/auth/use-auth";
import { APP_ROUTES } from "@/config/routes";

function DefaultForbiddenState() {
  return (
    <section className="rounded-[28px] border border-amber-200 bg-amber-50/70 p-6 text-amber-950 shadow-sm">
      <h2 className="text-2xl font-display font-extrabold">Access restricted</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-900/80">
        Your account is signed in, but it does not have permission to open this module.
      </p>
      <div className="mt-5">
        <Link to={APP_ROUTES.dashboard} className="btn-gold">
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}

export function PermissionGuard({
  permissions,
  requireAdmin = false,
  fallback,
  children,
}: {
  permissions?: Permission[];
  requireAdmin?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  const allowed =
    (requireAdmin ? currentUser.role === "admin" : true) &&
    (permissions?.length ? hasAllPermissions(currentUser, permissions) : true);

  if (!allowed) {
    return <>{fallback ?? <DefaultForbiddenState />}</>;
  }

  return <>{children}</>;
}

export function PermissionInline({
  permissions,
  requireAdmin = false,
  children,
}: {
  permissions?: Permission[];
  requireAdmin?: boolean;
  children: ReactNode;
}) {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  const allowed =
    (requireAdmin ? currentUser.role === "admin" : true) &&
    (permissions?.length ? hasAllPermissions(currentUser, permissions) : true);

  return allowed ? <>{children}</> : null;
}
