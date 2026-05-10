import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "./notifications.service";
import { queryKeys } from "@/lib/query-keys";

export function useInternalNotifications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.internal,
    queryFn: ({ signal }) => notificationsService.getInternalFeed(signal),
    enabled,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useClientNotifications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.client,
    queryFn: ({ signal }) => notificationsService.getClientFeed(signal),
    enabled,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useMarkInternalNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsService.markInternalRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.internal });
    },
  });
}

export function useMarkClientNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsService.markClientRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.client });
    },
  });
}

export function useMarkAllInternalNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsService.markAllInternalRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.internal });
    },
  });
}

export function useMarkAllClientNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsService.markAllClientRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.client });
    },
  });
}
