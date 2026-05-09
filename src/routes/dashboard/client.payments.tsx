import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderModulePage } from "@/features/dashboard/module-pages";

export const Route = createFileRoute("/dashboard/client/payments")({
  component: () => (
    <PlaceholderModulePage
      title="Payments"
      description="This route is reserved for the logged-in client’s own payment records."
      resourceLabel="Own payments"
    />
  ),
});
