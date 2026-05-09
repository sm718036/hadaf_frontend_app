import { createFileRoute } from "@tanstack/react-router";
import { ClientSelfProfilePage } from "@/features/clients/client-ui";

export const Route = createFileRoute("/dashboard/client/profile")({
  component: ClientSelfProfilePage,
});
