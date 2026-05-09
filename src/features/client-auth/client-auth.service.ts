import type { ClientSignInInput, ClientSignUpInput } from "@/features/client-auth/client-auth.schemas";
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

export const clientAuthService = {
  getCurrentClient: (signal?: AbortSignal) =>
    apiRequest<ClientSessionUser | null>("/api/client-auth/me", { signal }),
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
    apiRequest<ClientSessionUser>("/api/client-auth/sign-up", { method: "POST", body: input }),
  signOut: () => apiRequest<{ success: true }>("/api/client-auth/sign-out", { method: "POST" }),
};
