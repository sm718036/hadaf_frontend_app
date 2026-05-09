import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderModulePage } from "@/features/dashboard/module-pages";

export const Route = createFileRoute("/dashboard/client/appointments")({
  component: () => (
    <PlaceholderModulePage
      title="Appointments"
      description="This route is reserved for the logged-in client’s own appointments."
      resourceLabel="Own appointments"
    />
  ),
});
