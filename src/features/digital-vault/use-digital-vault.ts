import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { digitalVaultService } from "./digital-vault.service";

export function useDigitalVault(enabled = true) {
  return useQuery({
    queryKey: queryKeys.digitalVault.snapshot,
    queryFn: ({ signal }) => digitalVaultService.getSnapshot(signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useSaveDocumentRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: digitalVaultService.saveRule,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.digitalVault.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.all });
    },
  });
}
