import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { queryKeys } from "@/lib/query-keys";
import { operationsService } from "./operations.service";
import type { OperationsListFilters } from "./operations.schemas";

const DEFAULT_FILTERS: OperationsListFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  search: "",
  status: "",
  clientId: "",
  applicationId: "",
  staffId: "",
};

function withDefaults(filters: Partial<OperationsListFilters>) {
  return { ...DEFAULT_FILTERS, ...filters };
}

export function useTasks(filters: Partial<OperationsListFilters> & { enabled?: boolean } = {}) {
  const { enabled = true, ...rest } = filters;
  const params = withDefaults(rest);

  return useQuery({
    queryKey: queryKeys.operations.tasksList(params),
    queryFn: ({ signal }) => operationsService.listTasks(params, signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useDocuments(filters: Partial<OperationsListFilters> & { enabled?: boolean } = {}) {
  const { enabled = true, ...rest } = filters;
  const params = withDefaults(rest);

  return useQuery({
    queryKey: queryKeys.operations.documentsList(params),
    queryFn: ({ signal }) => operationsService.listDocuments(params, signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useAppointments(
  filters: Partial<OperationsListFilters> & { enabled?: boolean } = {},
) {
  const { enabled = true, ...rest } = filters;
  const params = withDefaults(rest);

  return useQuery({
    queryKey: queryKeys.operations.appointmentsList(params),
    queryFn: ({ signal }) => operationsService.listAppointments(params, signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function usePayments(filters: Partial<OperationsListFilters> & { enabled?: boolean } = {}) {
  const { enabled = true, ...rest } = filters;
  const params = withDefaults(rest);

  return useQuery({
    queryKey: queryKeys.operations.paymentsList(params),
    queryFn: ({ signal }) => operationsService.listPayments(params, signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useMessages(filters: Partial<OperationsListFilters> & { enabled?: boolean } = {}) {
  const { enabled = true, ...rest } = filters;
  const params = withDefaults(rest);

  return useQuery({
    queryKey: queryKeys.operations.messagesList(params),
    queryFn: ({ signal }) => operationsService.listMessages(params, signal),
    enabled,
    staleTime: 10_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useOwnDocuments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.ownDocuments,
    queryFn: ({ signal }) => operationsService.listOwnDocuments(signal),
    enabled,
    staleTime: 30_000,
  });
}

export function useOwnAppointments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.ownAppointments,
    queryFn: ({ signal }) => operationsService.listOwnAppointments(signal),
    enabled,
    staleTime: 30_000,
  });
}

export function useOwnPayments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.ownPayments,
    queryFn: ({ signal }) => operationsService.listOwnPayments(signal),
    enabled,
    staleTime: 30_000,
  });
}

export function useOwnMessages(enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.ownMessages,
    queryFn: ({ signal }) => operationsService.listOwnMessages(signal),
    enabled,
    staleTime: 10_000,
  });
}

function createInvalidateMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
  invalidateKeys: ReadonlyArray<readonly unknown[]>,
) {
  return function useInvalidateMutation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn,
      onSuccess: async () => {
        for (const key of invalidateKeys) {
          await queryClient.invalidateQueries({ queryKey: key });
        }
      },
    });
  };
}

export const useUpsertTask = createInvalidateMutation(operationsService.upsertTask, [
  queryKeys.operations.all,
]);
export const useDeleteTask = createInvalidateMutation(operationsService.deleteTask, [
  queryKeys.operations.all,
]);
export const useUpsertDocument = createInvalidateMutation(operationsService.upsertDocument, [
  queryKeys.operations.all,
  queryKeys.operations.ownDocuments,
]);
export const useDeleteDocument = createInvalidateMutation(operationsService.deleteDocument, [
  queryKeys.operations.all,
  queryKeys.operations.ownDocuments,
]);
export const useCreateOwnDocument = createInvalidateMutation(operationsService.createOwnDocument, [
  queryKeys.operations.ownDocuments,
]);
export const useUpsertAppointment = createInvalidateMutation(operationsService.upsertAppointment, [
  queryKeys.operations.all,
  queryKeys.operations.ownAppointments,
]);
export const useDeleteAppointment = createInvalidateMutation(
  operationsService.deleteAppointment,
  [queryKeys.operations.all, queryKeys.operations.ownAppointments],
);
export const useUpsertPayment = createInvalidateMutation(operationsService.upsertPayment, [
  queryKeys.operations.all,
  queryKeys.operations.ownPayments,
]);
export const useDeletePayment = createInvalidateMutation(operationsService.deletePayment, [
  queryKeys.operations.all,
  queryKeys.operations.ownPayments,
]);
export const useCreateMessage = createInvalidateMutation(operationsService.createMessage, [
  queryKeys.operations.all,
  queryKeys.operations.ownMessages,
]);
export const useCreateOwnMessage = createInvalidateMutation(operationsService.createOwnMessage, [
  queryKeys.operations.ownMessages,
  queryKeys.operations.all,
]);

export function useUploadDocumentFile() {
  return useMutation({ mutationFn: operationsService.uploadDocumentFile });
}

export function useUploadOwnDocumentFile() {
  return useMutation({ mutationFn: operationsService.uploadOwnDocumentFile });
}
