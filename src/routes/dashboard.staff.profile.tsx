import { createFileRoute } from "@tanstack/react-router";
import { DashboardProfilePage } from "@/routes/dashboard.profile";

export const Route = createFileRoute("/dashboard/staff/profile")({
  component: DashboardProfilePage,
});
