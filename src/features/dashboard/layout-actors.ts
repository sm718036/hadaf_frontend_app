import type { SessionUser } from "@/features/auth/auth.service";
import { getRoleLabel } from "@/features/dashboard/access-control";

type DashboardLayoutActor = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  roleLabel: string;
};

export function toInternalLayoutActor(user: SessionUser): DashboardLayoutActor {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    roleLabel: getRoleLabel(user.role),
  };
}

export function toClientLayoutActor(client: {
  id: string;
  name: string;
  email: string;
}): DashboardLayoutActor {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    avatarUrl: null,
    roleLabel: "Client",
  };
}
