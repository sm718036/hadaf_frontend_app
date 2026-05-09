import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/features/auth/use-auth";
import { ModuleOverview } from "@/features/dashboard/module-pages";

export const Route = createFileRoute("/dashboard/admin/")({
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  return (
    <ModuleOverview
      title="Administrator Access"
      description="Admins can access every dashboard area, manage user access, and work with the existing clients and landing CMS modules."
    />
  );
}
