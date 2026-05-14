import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { configurationVaultService } from "./configuration-vault.service";

export function useConfigurationVaultMetadata(enabled = true) {
  return useQuery({
    queryKey: queryKeys.configurationVault.metadata,
    queryFn: ({ signal }) => configurationVaultService.getMetadata(signal),
    enabled,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useConfigurationVault(enabled = true) {
  return useQuery({
    queryKey: queryKeys.configurationVault.snapshot,
    queryFn: ({ signal }) => configurationVaultService.getSnapshot(signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

function useVaultMutation<TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.configurationVault.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
}

export function useSaveVaultCountry() {
  return useVaultMutation(configurationVaultService.saveCountry);
}

export function useSaveVaultVisaCategory() {
  return useVaultMutation(configurationVaultService.saveVisaCategory);
}

export function useSaveVaultWorkflowStage() {
  return useVaultMutation(configurationVaultService.saveWorkflowStage);
}

export function useSaveVaultDocumentChecklist() {
  return useVaultMutation(configurationVaultService.saveDocumentChecklist);
}

export function useSaveVaultFinancialRule() {
  return useVaultMutation(configurationVaultService.saveFinancialRule);
}
