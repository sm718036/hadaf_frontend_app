import { createFileRoute } from "@tanstack/react-router";
import { ClientApplicationPage } from "@/features/applications/applications-ui";

export const Route = createFileRoute("/dashboard/client/application")({
  component: ClientApplicationPage,
});
