import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientAuthService } from "@/features/client-auth/client-auth.service";
import { queryKeys } from "@/lib/query-keys";

export function useCurrentClient() {
  return useQuery({
    queryKey: queryKeys.clientAuth.currentClient,
    queryFn: ({ signal }) => clientAuthService.getCurrentClient(signal),
    retry: false,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
  });
}

export function useClientSessions() {
  return useQuery({
    queryKey: queryKeys.clientAuth.sessions,
    queryFn: ({ signal }) => clientAuthService.listSessions(signal),
    retry: false,
    staleTime: 60_000,
  });
}

export function useClientSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientAuthService.signIn,
    onSuccess: (client) => {
      queryClient.setQueryData(queryKeys.clientAuth.currentClient, client);
    },
  });
}

export function useClientSignUp() {
  return useMutation({
    mutationFn: clientAuthService.signUp,
  });
}

export function useClientSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientAuthService.signOut,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.clientAuth.currentClient, null);
      queryClient.setQueryData(queryKeys.clientAuth.sessions, []);
    },
  });
}

export function useRevokeClientSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientAuthService.revokeSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clientAuth.sessions });
      await queryClient.invalidateQueries({ queryKey: queryKeys.clientAuth.currentClient });
    },
  });
}

export function useUpdateClientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientAuthService.updateProfile,
    onSuccess: (client) => {
      queryClient.setQueryData(queryKeys.clientAuth.currentClient, client);
    },
  });
}
