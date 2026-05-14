import type { SignInInput, RequestPasswordResetInput } from "@/features/auth/auth.schemas";
import type { SessionUser, PasswordActionResult } from "@/features/auth/auth.service";
import type { ClientSessionUser } from "@/features/client-auth/client-auth.service";
import { apiRequest } from "@/lib/api";

export type AuthenticatedActor =
  | {
      accountType: "internal";
      dashboardArea: "admin" | "staff";
      user: SessionUser;
    }
  | {
      accountType: "client";
      dashboardArea: "client";
      user: ClientSessionUser;
    };

export const sessionService = {
  getCurrentActor: (signal?: AbortSignal) =>
    apiRequest<AuthenticatedActor | null>("/api/session/me", { signal }),
  signIn: (input: SignInInput) =>
    apiRequest<AuthenticatedActor>("/api/session/sign-in", { method: "POST", body: input }),
  signOut: () => apiRequest<{ success: true }>("/api/session/sign-out", { method: "POST" }),
  requestPasswordReset: (input: RequestPasswordResetInput) =>
    apiRequest<PasswordActionResult>("/api/session/request-password-reset", {
      method: "POST",
      body: input,
    }),
};
