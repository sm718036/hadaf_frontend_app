import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderModulePage } from "@/features/dashboard/module-pages";

export const Route = createFileRoute("/dashboard/client/messages")({
  component: () => (
    <PlaceholderModulePage
      title="Messages"
      description="This route is reserved for the logged-in client’s own conversations."
      resourceLabel="Own messages"
    />
  ),
});
