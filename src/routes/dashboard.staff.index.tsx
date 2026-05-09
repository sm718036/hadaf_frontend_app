import { createFileRoute } from "@tanstack/react-router";
import { useCurrentUser } from "@/features/auth/use-auth";
import { ModuleOverview } from "@/features/dashboard/module-pages";

export const Route = createFileRoute("/dashboard/staff/")({
  component: StaffOverviewPage,
});

function StaffOverviewPage() {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  return (
    <ModuleOverview
      title="Counselor Workspace"
      description="Staff navigation is limited to assigned work areas. Existing client management remains wired through the current clients module, while the rest of the structure is ready for assigned-resource APIs."
    />
  );
}
