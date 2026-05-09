import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderModulePage } from "@/features/dashboard/module-pages";

export const Route = createFileRoute("/dashboard/staff/appointments")({
  component: () => (
    <PlaceholderModulePage
      title="Appointments"
      description="This route is prepared for staff appointments tied to assigned leads and clients."
      resourceLabel="Assigned appointments"
    />
  ),
});
