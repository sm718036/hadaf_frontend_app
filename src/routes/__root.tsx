import { QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { createAppQueryClient } from "@/lib/query-client";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found.</p>
        <Link to="/" className="btn-gold mt-6">
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hadaf Consultants | Global Visa and Immigration Guidance" },
      {
        name: "description",
        content:
          "Trusted visa and immigration consultants helping you study, visit, and settle abroad with expert guidance for Europe, the UK, and the United States.",
      },
      { property: "og:title", content: "Hadaf Consultants" },
      {
        property: "og:description",
        content:
          "Study, visit, and immigration visa guidance with transparent support for Europe, the UK, and the United States.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  ssr: false,
  component: () => <Outlet />,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createAppQueryClient());

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster richColors position="bottom-right" />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
