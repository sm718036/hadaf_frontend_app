import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { sessionService } from "@/features/session/session.service";

export function useCurrentActor() {
  return useQuery({
    queryKey: queryKeys.session.currentActor,
    queryFn: ({ signal }) => sessionService.getCurrentActor(signal),
    retry: false,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
  });
}

export function useUnifiedSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionService.signIn,
    onSuccess: (actor) => {
      queryClient.setQueryData(queryKeys.session.currentActor, actor);
      queryClient.setQueryData(
        queryKeys.auth.currentUser,
        actor.accountType === "internal" ? actor.user : null,
      );
      queryClient.setQueryData(
        queryKeys.clientAuth.currentClient,
        actor.accountType === "client" ? actor.user : null,
      );
    },
  });
}

export function useUnifiedSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionService.signOut,
    onSuccess: async () => {
      queryClient.setQueryData(queryKeys.session.currentActor, null);
      queryClient.setQueryData(queryKeys.auth.currentUser, null);
      queryClient.setQueryData(queryKeys.auth.sessions, []);
      queryClient.setQueryData(queryKeys.clientAuth.currentClient, null);
      queryClient.setQueryData(queryKeys.clientAuth.sessions, []);
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
    },
  });
}

export function useUnifiedPasswordResetRequest() {
  return useMutation({
    mutationFn: sessionService.requestPasswordReset,
  });
}
