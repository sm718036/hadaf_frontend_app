import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { academicEngineService } from "./academic-engine.service";

export function useAcademicEngine(enabled = true) {
  return useQuery({
    queryKey: queryKeys.academicEngine.snapshot,
    queryFn: ({ signal }) => academicEngineService.getSnapshot(signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useAcademicEngineMetadata(enabled = true) {
  return useQuery({
    queryKey: queryKeys.academicEngine.metadata,
    queryFn: ({ signal }) => academicEngineService.getMetadata(signal),
    enabled,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}

function useAcademicMutation<TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.academicEngine.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
    },
  });
}

export function useSavePartnerUniversity() {
  return useAcademicMutation(academicEngineService.saveUniversity);
}

export function useSavePartnerCampus() {
  return useAcademicMutation(academicEngineService.saveCampus);
}

export function useSavePartnerCourse() {
  return useAcademicMutation(academicEngineService.saveCourse);
}

export function useAcademicWorkspace(applicationId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.academicEngine.workspace(applicationId),
    queryFn: ({ signal }) => academicEngineService.getWorkspace(applicationId, signal),
    enabled,
    staleTime: 15_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useSaveAcademicSop(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => academicEngineService.saveSop(applicationId, body),
    onSuccess: async (workspace) => {
      queryClient.setQueryData(queryKeys.academicEngine.workspace(applicationId), workspace);
      await queryClient.invalidateQueries({ queryKey: queryKeys.applications.detail(applicationId) });
    },
  });
}

export function useAddAcademicComment(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => academicEngineService.addComment(applicationId, body),
    onSuccess: (workspace) => {
      queryClient.setQueryData(queryKeys.academicEngine.workspace(applicationId), workspace);
    },
  });
}
