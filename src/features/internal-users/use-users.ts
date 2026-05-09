import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { queryKeys } from "@/lib/query-keys";
import { usersService } from "./users.service";

export function useInternalUsers({
  enabled = true,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search = "",
}: {
  enabled?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
} = {}) {
  return useQuery({
    queryKey: queryKeys.users.list({ page, pageSize, search }),
    queryFn: ({ signal }) => usersService.list({ page, pageSize, search }, signal),
    enabled,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateInternalUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateInternalUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof usersService.update>[1] }) =>
      usersService.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useDeleteInternalUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
