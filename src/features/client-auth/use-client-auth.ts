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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientAuthService.signUp,
    onSuccess: (client) => {
      queryClient.setQueryData(queryKeys.clientAuth.currentClient, client);
    },
  });
}

export function useClientSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientAuthService.signOut,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.clientAuth.currentClient, null);
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
