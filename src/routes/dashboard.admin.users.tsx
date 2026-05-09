import { createFileRoute } from "@tanstack/react-router";
import { DashboardUsersPage } from "@/routes/dashboard.users";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: DashboardUsersPage,
});
