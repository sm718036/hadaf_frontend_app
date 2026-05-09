import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Hadaf" },
      { name: "description", content: "Manage Hadaf consultancy clients." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Outlet,
});
