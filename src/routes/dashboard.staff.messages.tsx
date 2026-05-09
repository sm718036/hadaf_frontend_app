import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderModulePage } from "@/features/dashboard/module-pages";

export const Route = createFileRoute("/dashboard/staff/messages")({
  component: () => (
    <PlaceholderModulePage
      title="Messages"
      description="This route is prepared for staff messaging scoped to assigned conversations."
      resourceLabel="Assigned messages"
    />
  ),
});
