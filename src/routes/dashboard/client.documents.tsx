import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderModulePage } from "@/features/dashboard/module-pages";

export const Route = createFileRoute("/dashboard/client/documents")({
  component: () => (
    <PlaceholderModulePage
      title="Documents"
      description="This route is reserved for the logged-in client’s own documents."
      resourceLabel="Own documents"
    />
  ),
});
