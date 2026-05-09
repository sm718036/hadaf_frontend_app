import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderModulePage } from "@/features/dashboard/module-pages";

export const Route = createFileRoute("/dashboard/staff/tasks")({
  component: () => (
    <PlaceholderModulePage
      title="Tasks"
      description="This route is prepared for counselor tasks assigned to the logged-in staff account."
      resourceLabel="Assigned tasks"
    />
  ),
});
