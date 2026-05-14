import type {
  ChangeClientPasswordInput,
  ClientSignInInput,
  ClientSignUpInput,
  RequestClientPasswordResetInput,
  ResetClientPasswordInput,
} from "@/features/client-auth/client-auth.schemas";
import { apiRequest } from "@/lib/api";

export type ClientSessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cnic: string | null;
  passportNumber: string | null;
  dateOfBirth: string | null;
  address: string | null;
  countryOfResidence: string | null;
  targetCountry: string | null;
  targetService: string | null;
  currentApplicationStatus:
    | "not_started"
    | "in_progress"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "completed";
  status: "active" | "inactive" | "completed" | "rejected";
  emergencyContact: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClientSignUpResult = {
  success: true;
  message: string;
};

export type VerifyClientEmailResult = {
  success: true;
  email: string;
};

export type ClientPasswordActionResult = {
  success: true;
  message: string;
};

export type ClientAccountSessionRecord = {
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

export const clientAuthService = {
  getCurrentClient: (signal?: AbortSignal) =>
    apiRequest<ClientSessionUser | null>("/api/client-auth/me", { signal }),
  listSessions: (signal?: AbortSignal) =>
    apiRequest<ClientAccountSessionRecord[]>("/api/client-auth/sessions", { signal }),
  updateProfile: (input: {
    fullName: string;
    email: string;
    phone: string;
    cnic: string;
    passportNumber: string;
    dateOfBirth: string;
    address: string;
    countryOfResidence: string;
    emergencyContact: string;
  }) => apiRequest<ClientSessionUser>("/api/client-auth/profile", { method: "PUT", body: input }),
  signIn: (input: ClientSignInInput) =>
    apiRequest<ClientSessionUser>("/api/client-auth/sign-in", { method: "POST", body: input }),
  signUp: (input: ClientSignUpInput) =>
    apiRequest<ClientSignUpResult>("/api/client-auth/sign-up", { method: "POST", body: input }),
  requestPasswordReset: (input: RequestClientPasswordResetInput) =>
    apiRequest<ClientPasswordActionResult>("/api/client-auth/request-password-reset", {
      method: "POST",
      body: input,
    }),
  resetPassword: (input: ResetClientPasswordInput) =>
    apiRequest<ClientPasswordActionResult>("/api/client-auth/reset-password", {
      method: "POST",
      body: input,
    }),
  changePassword: (input: ChangeClientPasswordInput) =>
    apiRequest<ClientPasswordActionResult>("/api/client-auth/change-password", {
      method: "POST",
      body: input,
    }),
  verifyEmail: (token: string) =>
    apiRequest<VerifyClientEmailResult>(
      `/api/client-auth/verify-email?token=${encodeURIComponent(token)}`,
    ),
  signOut: () => apiRequest<{ success: true }>("/api/client-auth/sign-out", { method: "POST" }),
  revokeSession: (sessionId: string) =>
    apiRequest<{ success: true }>(`/api/client-auth/sessions/${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    }),
};
