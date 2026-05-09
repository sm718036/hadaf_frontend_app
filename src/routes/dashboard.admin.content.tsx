import { createFileRoute } from "@tanstack/react-router";
import { DashboardContentPage } from "@/routes/dashboard.content";

export const Route = createFileRoute("/dashboard/admin/content")({
  component: DashboardContentPage,
});
