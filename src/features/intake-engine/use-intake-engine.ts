import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { intakeEngineService } from "./intake-engine.service";

export function usePublicLeadIntakeMetadata(enabled = true) {
  return useQuery({
    queryKey: queryKeys.intakeEngine.publicMetadata,
    queryFn: ({ signal }) => intakeEngineService.getPublicMetadata(signal),
    enabled,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useIntakeQuestions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.intakeEngine.questions,
    queryFn: ({ signal }) => intakeEngineService.listQuestions(signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useSaveIntakeQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: intakeEngineService.saveQuestion,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.intakeEngine.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}
