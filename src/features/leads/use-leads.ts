import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { queryKeys } from "@/lib/query-keys";
import { leadsService, type LeadListFilters } from "./leads.service";

export function useLeads({
  enabled = true,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
  status = "",
  country = "",
  service = "",
  staffId = "",
  dateFrom = "",
  dateTo = "",
}: Partial<LeadListFilters> & { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.leads.list({
      page,
      pageSize,
      search,
      status,
      country,
      service,
      staffId,
      dateFrom,
      dateTo,
    }),
    queryFn: ({ signal }) =>
      leadsService.list(
        { page, pageSize, search, status, country, service, staffId, dateFrom, dateTo },
        signal,
      ),
    enabled,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useLead(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: ({ signal }) => leadsService.getById(id, signal),
    enabled,
    staleTime: 30_000,
  });
}

export function useUpsertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leadsService.upsert,
    onSuccess: async (lead) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      queryClient.setQueryData(queryKeys.leads.detail(lead.id), (current: unknown) =>
        current && typeof current === "object" && current !== null && "history" in current
          ? { ...(current as { history: unknown }), lead }
          : current,
      );
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => leadsService.convert(id, { notes }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(result.lead.id) });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leadsService.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

export function useSubmitPublicLead() {
  return useMutation({
    mutationFn: leadsService.submitPublicLead,
  });
}
