import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsService } from "@/features/clients/clients.service";
import { queryKeys } from "@/lib/query-keys";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

export function useClients({
  enabled = true,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
  status = "",
  country = "",
  targetCountry = "",
  targetService = "",
  staffId = "",
}: {
  enabled?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  country?: string;
  targetCountry?: string;
  targetService?: string;
  staffId?: string;
} = {}) {
  return useQuery({
    queryKey: queryKeys.clients.list({
      page,
      pageSize,
      search,
      status,
      country,
      targetCountry,
      targetService,
      staffId,
    }),
    queryFn: ({ signal }) =>
      clientsService.getClients(
        { page, pageSize, search, status, country, targetCountry, targetService, staffId },
        signal,
      ),
    enabled,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useClient(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: ({ signal }) => clientsService.getClientDetail(id, signal),
    enabled,
    staleTime: 30_000,
  });
}

export function useUpsertClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientsService.upsertClient,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clientsService.deleteClient,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
    },
  });
}
