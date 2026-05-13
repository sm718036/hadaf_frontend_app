import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AppDialogsProvider } from "@/components/ui/app-dialogs";
import { AppRouter } from "@/app/router";
import { createAppQueryClient } from "@/lib/query-client";

function getRouterBaseName() {
  const baseUrl = import.meta.env.BASE_URL?.trim() || "/";

  if (baseUrl === "/") {
    return undefined;
  }

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function App() {
  const [queryClient] = useState(() => createAppQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AppDialogsProvider>
        <BrowserRouter basename={getRouterBaseName()}>
          <AppRouter />
        </BrowserRouter>
      </AppDialogsProvider>
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  );
}
