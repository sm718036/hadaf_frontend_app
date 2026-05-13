import type { BootstrapAdminInput, Permission, UserRole, SignInInput } from "@/features/auth/auth.schemas";
import { apiFormRequest, apiRequest } from "@/lib/api";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  permissions: Permission[];
  emailVerifiedAt: string | null;
  createdAt: string;
};

export type VerifyEmailResult = {
  success: true;
  email: string;
};

export type UserSessionRecord = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  rememberMe: boolean;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt: string | null;
  isCurrent: boolean;
};

type BootstrapStatus = {
  requiresSetup: boolean;
};

export const authService = {
  getBootstrapStatus: (signal?: AbortSignal) =>
    apiRequest<BootstrapStatus>("/api/auth/bootstrap-status", { signal }),
  getCurrentUser: (signal?: AbortSignal) => apiRequest<SessionUser | null>("/api/auth/me", { signal }),
  listSessions: (signal?: AbortSignal) => apiRequest<UserSessionRecord[]>("/api/auth/sessions", { signal }),
  signIn: (input: SignInInput) =>
    apiRequest<SessionUser>("/api/auth/sign-in", { method: "POST", body: input }),
  verifyEmail: (token: string) =>
    apiRequest<VerifyEmailResult>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`),
  bootstrapAdmin: (input: BootstrapAdminInput) =>
    apiRequest<SessionUser>("/api/auth/bootstrap", { method: "POST", body: input }),
  signOut: () => apiRequest<{ success: true }>("/api/auth/sign-out", { method: "POST" }),
  revokeSession: (sessionId: string) =>
    apiRequest<{ success: true }>(`/api/auth/sessions/${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    }),
  uploadProfileAvatar: (file: File) => {
    const formData = new FormData();
    formData.set("file", file);

    return apiFormRequest<SessionUser>("/api/auth/profile/avatar", {
      method: "POST",
      formData,
    });
  },
  removeProfileAvatar: () =>
    apiRequest<SessionUser>("/api/auth/profile/avatar", { method: "DELETE" }),
};
