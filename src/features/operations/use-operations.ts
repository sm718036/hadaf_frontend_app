import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { queryKeys } from "@/lib/query-keys";
import { operationsService } from "./operations.service";
import type {
  CreateMeetingInput,
  CreatePortalMessageInput,
  OpenThreadInput,
  OperationsListFilters,
  UpdateMeetingStatusInput,
} from "./operations.schemas";

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
    placeholderData: (previousData) => previousData,
  });
}

export function useOwnAppointments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.ownAppointments,
    queryFn: ({ signal }) => operationsService.listOwnAppointments(signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useOwnPayments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.ownPayments,
    queryFn: ({ signal }) => operationsService.listOwnPayments(signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useOwnMessages(enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.ownMessages,
    queryFn: ({ signal }) => operationsService.listOwnMessages(signal),
    enabled,
    staleTime: 10_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useChatContacts(search: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.chatContacts(search),
    queryFn: ({ signal }) => operationsService.listChatContacts(search, signal),
    enabled,
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useChatThreads(search: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.chatThreads(search),
    queryFn: ({ signal }) => operationsService.listChatThreads(search, signal),
    enabled,
    staleTime: 5_000,
    refetchInterval: enabled ? 10_000 : false,
    placeholderData: (previousData) => previousData,
  });
}

export function useChatConversation(threadId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.chatConversation(threadId),
    queryFn: ({ signal }) => operationsService.getChatConversation(threadId, signal),
    enabled: enabled && Boolean(threadId),
    staleTime: 3_000,
    refetchInterval: enabled && Boolean(threadId) ? 5_000 : false,
    placeholderData: (previousData) => previousData,
  });
}

export function useOwnPortalConversation(enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.ownChatConversation,
    queryFn: ({ signal }) => operationsService.getOwnPortalConversation(signal),
    enabled,
    staleTime: 3_000,
    refetchInterval: enabled ? 5_000 : false,
    placeholderData: (previousData) => previousData,
  });
}

export function usePortalMeetings(enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.meetings,
    queryFn: ({ signal }) => operationsService.listMeetings(signal),
    enabled,
    staleTime: 10_000,
    refetchInterval: enabled ? 15_000 : false,
    placeholderData: (previousData) => previousData,
  });
}

export function useOwnPortalMeetings(enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.ownMeetings,
    queryFn: ({ signal }) => operationsService.listOwnPortalMeetings(signal),
    enabled,
    staleTime: 10_000,
    refetchInterval: enabled ? 15_000 : false,
    placeholderData: (previousData) => previousData,
  });
}

export function useMeetingDetail(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.meetingDetail(meetingId),
    queryFn: ({ signal }) => operationsService.getMeetingDetail(meetingId, signal),
    enabled: enabled && Boolean(meetingId),
    staleTime: 10_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useOwnMeetingDetail(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.operations.meetingDetail(meetingId),
    queryFn: ({ signal }) => operationsService.getOwnMeetingDetail(meetingId, signal),
    enabled: enabled && Boolean(meetingId),
    staleTime: 10_000,
    placeholderData: (previousData) => previousData,
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
export const useDeleteAppointment = createInvalidateMutation(operationsService.deleteAppointment, [
  queryKeys.operations.all,
  queryKeys.operations.ownAppointments,
]);
export const useUpsertPayment = createInvalidateMutation(operationsService.upsertPayment, [
  queryKeys.operations.all,
  queryKeys.operations.ownPayments,
]);
export const useLogPaymentReceipt = createInvalidateMutation(operationsService.logPaymentReceipt, [
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

export function useUploadPaymentReceiptImage() {
  return useMutation({ mutationFn: operationsService.uploadPaymentReceiptImage });
}

export function useOpenChatThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OpenThreadInput) => operationsService.openChatThread(input),
    onSuccess: async (conversation) => {
      queryClient.setQueryData(
        queryKeys.operations.chatConversation(conversation.threadId),
        conversation,
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.chatThreads("") });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.all });
    },
  });
}

export function useSendPortalMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePortalMessageInput) => operationsService.sendPortalMessage(input),
    onSuccess: async (conversation) => {
      queryClient.setQueryData(
        queryKeys.operations.chatConversation(conversation.threadId),
        conversation,
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.chatThreads("") });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.meetings });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.all });
    },
  });
}

export function useSendClientPortalMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: operationsService.sendClientPortalMessage,
    onSuccess: async (conversation) => {
      queryClient.setQueryData(queryKeys.operations.ownChatConversation, conversation);
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.ownMeetings });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.all });
    },
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMeetingInput) => operationsService.createMeeting(input),
    onSuccess: async (meeting) => {
      queryClient.setQueryData(queryKeys.operations.meetingDetail(meeting.id), meeting);
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.meetings });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.ownMeetings });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.chatThreads("") });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.all });
    },
  });
}

export function useUpdateMeetingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ meetingId, input }: { meetingId: string; input: UpdateMeetingStatusInput }) =>
      operationsService.updateMeetingStatus(meetingId, input),
    onSuccess: async (meeting) => {
      queryClient.setQueryData(queryKeys.operations.meetingDetail(meeting.id), meeting);
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.meetings });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.ownMeetings });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operations.all });
    },
  });
}
