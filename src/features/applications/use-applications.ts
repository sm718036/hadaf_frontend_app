import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { queryKeys } from "@/lib/query-keys";
import { applicationsService, type ApplicationListFilters } from "./applications.service";

export function useApplications({
  enabled = true,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
  country = "",
  stage = "",
  status = "",
  staffId = "",
  clientId = "",
  dateFrom = "",
  dateTo = "",
}: Partial<ApplicationListFilters> & { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.applications.list({
      page,
      pageSize,
      search,
      country,
      stage,
      status,
      staffId,
      clientId,
      dateFrom,
      dateTo,
    }),
    queryFn: ({ signal }) =>
      applicationsService.list(
        { page, pageSize, search, country, stage, status, staffId, clientId, dateFrom, dateTo },
        signal,
      ),
    enabled,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useApplication(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.applications.detail(id),
    queryFn: ({ signal }) => applicationsService.getById(id, signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useOwnApplications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.applications.own,
    queryFn: ({ signal }) => applicationsService.listOwn(signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useUpsertApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationsService.upsert,
    onSuccess: async (application) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.clientAuth.currentClient });
      queryClient.setQueryData(queryKeys.applications.detail(application.id), (current: unknown) =>
        current && typeof current === "object" && current !== null && "history" in current
          ? { ...(current as { history: unknown }), application }
          : current,
      );
    },
  });
}

export function useMoveApplicationStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, direction, note }: { id: string; direction: "next" | "previous"; note?: string }) =>
      applicationsService.moveStage(id, { direction, note: note ?? "" }),
    onSuccess: async (application) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications.detail(application.id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.clientAuth.currentClient });
    },
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applicationsService.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.clientAuth.currentClient });
    },
  });
}
