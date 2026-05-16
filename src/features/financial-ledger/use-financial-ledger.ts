import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { financialLedgerService } from "./financial-ledger.service";

export function useFinancialLedger(enabled = true) {
  return useQuery({
    queryKey: queryKeys.financialLedger.snapshot,
    queryFn: ({ signal }) => financialLedgerService.getSnapshot(signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useSaveFeeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financialLedgerService.saveFeeItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.financialLedger.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.all });
    },
  });
}
