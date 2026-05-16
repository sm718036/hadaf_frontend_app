import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { authService } from "@/features/auth/auth.service";

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: ({ signal }) => authService.getCurrentUser(signal),
    retry: false,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
  });
}

export function useUserSessions() {
  return useQuery({
    queryKey: queryKeys.auth.sessions,
    queryFn: ({ signal }) => authService.listSessions(signal),
    retry: false,
    staleTime: 60_000,
  });
}

export function useBootstrapStatus() {
  return useQuery({
    queryKey: ["auth", "bootstrap-status"],
    queryFn: ({ signal }) => authService.getBootstrapStatus(signal),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.signIn,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.currentUser, user);
    },
  });
}

export function useBootstrapAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.bootstrapAdmin,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.currentUser, user);
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.signOut,
    onSuccess: async () => {
      queryClient.setQueryData(queryKeys.auth.currentUser, null);
      queryClient.setQueryData(queryKeys.auth.sessions, []);
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
    },
  });
}

export function useRevokeUserSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.revokeSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser });
    },
  });
}

export function useUploadProfileAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.uploadProfileAvatar,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.currentUser, user);
    },
  });
}

export function useRemoveProfileAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.removeProfileAvatar,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.currentUser, user);
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.currentUser, null);
      queryClient.setQueryData(queryKeys.auth.sessions, []);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.currentUser, user);
      queryClient.setQueryData(queryKeys.session.currentActor, {
        accountType: "internal",
        dashboardArea: user.role === "admin" ? "admin" : "staff",
        user,
      });
    },
  });
}
