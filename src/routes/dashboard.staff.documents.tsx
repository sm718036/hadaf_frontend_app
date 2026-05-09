import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderModulePage } from "@/features/dashboard/module-pages";

export const Route = createFileRoute("/dashboard/staff/documents")({
  component: () => (
    <PlaceholderModulePage
      title="Documents"
      description="This route is prepared for staff document review limited to assigned records."
      resourceLabel="Assigned documents"
    />
  ),
});
