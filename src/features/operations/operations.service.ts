import { apiFormRequest, apiRequest } from "@/lib/api";
import type {
  Appointment,
  ChatContact,
  ChatThreadSummary,
  CreateClientDocumentInput,
  CreateClientMessageInput,
  CreateClientPortalMessageInput,
  CreateMeetingInput,
  CreateMessageInput,
  CreatePortalMessageInput,
  DocumentRecord,
  MessageRecord,
  OperationsListFilters,
  OperationsListResponse,
  Payment,
  PortalConversation,
  PortalMeeting,
  Task,
  OpenThreadInput,
  UpdateMeetingStatusInput,
  UpsertAppointmentInput,
  UpsertDocumentInput,
  UpsertPaymentInput,
  UpsertTaskInput,
} from "./operations.schemas";

type UploadedFileAsset = {
  src: string;
  contentType: string;
  size: number;
  fileName: string;
};

function buildOperationsQueryString(params: OperationsListFilters) {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("pageSize", String(params.pageSize));

  if (params.search.trim()) searchParams.set("search", params.search.trim());
  if (params.status.trim()) searchParams.set("status", params.status.trim());
  if (params.clientId.trim()) searchParams.set("clientId", params.clientId.trim());
  if (params.applicationId.trim()) searchParams.set("applicationId", params.applicationId.trim());
  if (params.staffId.trim()) searchParams.set("staffId", params.staffId.trim());

  return searchParams.toString();
}

function uploadFile(path: string, file: File) {
  const formData = new FormData();
  formData.set("file", file);
  return apiFormRequest<UploadedFileAsset>(path, { method: "POST", formData });
}

export const operationsService = {
  listTasks: (params: OperationsListFilters, signal?: AbortSignal) =>
    apiRequest<OperationsListResponse<Task>>(`/api/tasks?${buildOperationsQueryString(params)}`, {
      signal,
    }),
  upsertTask: (input: UpsertTaskInput) =>
    apiRequest<Task>("/api/tasks", { method: "POST", body: input }),
  deleteTask: (id: string) =>
    apiRequest<{ success: true }>(`/api/tasks/${id}`, { method: "DELETE" }),

  listDocuments: (params: OperationsListFilters, signal?: AbortSignal) =>
    apiRequest<OperationsListResponse<DocumentRecord>>(
      `/api/documents?${buildOperationsQueryString(params)}`,
      { signal },
    ),
  listOwnDocuments: (signal?: AbortSignal) =>
    apiRequest<DocumentRecord[]>("/api/client-auth/documents", { signal }),
  upsertDocument: (input: UpsertDocumentInput) =>
    apiRequest<DocumentRecord>("/api/documents", { method: "POST", body: input }),
  createOwnDocument: (input: CreateClientDocumentInput) =>
    apiRequest<DocumentRecord>("/api/client-auth/documents", { method: "POST", body: input }),
  deleteDocument: (id: string) =>
    apiRequest<{ success: true }>(`/api/documents/${id}`, { method: "DELETE" }),
  uploadDocumentFile: (file: File) => uploadFile("/api/uploads/document-file", file),
  uploadOwnDocumentFile: (file: File) => uploadFile("/api/client-auth/uploads/document-file", file),

  listAppointments: (params: OperationsListFilters, signal?: AbortSignal) =>
    apiRequest<OperationsListResponse<Appointment>>(
      `/api/appointments?${buildOperationsQueryString(params)}`,
      { signal },
    ),
  listOwnAppointments: (signal?: AbortSignal) =>
    apiRequest<Appointment[]>("/api/client-auth/appointments", { signal }),
  upsertAppointment: (input: UpsertAppointmentInput) =>
    apiRequest<Appointment>("/api/appointments", { method: "POST", body: input }),
  deleteAppointment: (id: string) =>
    apiRequest<{ success: true }>(`/api/appointments/${id}`, { method: "DELETE" }),

  listPayments: (params: OperationsListFilters, signal?: AbortSignal) =>
    apiRequest<OperationsListResponse<Payment>>(
      `/api/payments?${buildOperationsQueryString(params)}`,
      { signal },
    ),
  listOwnPayments: (signal?: AbortSignal) =>
    apiRequest<Payment[]>("/api/client-auth/payments", { signal }),
  upsertPayment: (input: UpsertPaymentInput) =>
    apiRequest<Payment>("/api/payments", { method: "POST", body: input }),
  deletePayment: (id: string) =>
    apiRequest<{ success: true }>(`/api/payments/${id}`, { method: "DELETE" }),

  listMessages: (params: OperationsListFilters, signal?: AbortSignal) =>
    apiRequest<OperationsListResponse<MessageRecord>>(
      `/api/messages?${buildOperationsQueryString(params)}`,
      { signal },
    ),
  listOwnMessages: (signal?: AbortSignal) =>
    apiRequest<MessageRecord[]>("/api/client-auth/messages", { signal }),
  createMessage: (input: CreateMessageInput) =>
    apiRequest<MessageRecord>("/api/messages", { method: "POST", body: input }),
  createOwnMessage: (input: CreateClientMessageInput) =>
    apiRequest<MessageRecord>("/api/client-auth/messages", { method: "POST", body: input }),

  listChatContacts: (search: string, signal?: AbortSignal) =>
    apiRequest<ChatContact[]>(`/api/chat/contacts?search=${encodeURIComponent(search.trim())}`, {
      signal,
    }),
  listChatThreads: (search: string, signal?: AbortSignal) =>
    apiRequest<ChatThreadSummary[]>(
      `/api/chat/threads?search=${encodeURIComponent(search.trim())}`,
      { signal },
    ),
  getChatConversation: (threadId: string, signal?: AbortSignal) =>
    apiRequest<PortalConversation>(`/api/chat/threads/${threadId}`, { signal }),
  openChatThread: (input: OpenThreadInput) =>
    apiRequest<PortalConversation>("/api/chat/thread", { method: "POST", body: input }),
  sendPortalMessage: (input: CreatePortalMessageInput) =>
    apiRequest<PortalConversation>("/api/chat/messages", { method: "POST", body: input }),
  listMeetings: (signal?: AbortSignal) =>
    apiRequest<PortalMeeting[]>("/api/chat/meetings", { signal }),
  createMeeting: (input: CreateMeetingInput) =>
    apiRequest<PortalMeeting>("/api/chat/meetings", { method: "POST", body: input }),
  getMeetingDetail: (meetingId: string, signal?: AbortSignal) =>
    apiRequest<PortalMeeting>(`/api/chat/meetings/${meetingId}`, { signal }),
  updateMeetingStatus: (meetingId: string, input: UpdateMeetingStatusInput) =>
    apiRequest<PortalMeeting>(`/api/chat/meetings/${meetingId}/status`, {
      method: "PUT",
      body: input,
    }),

  getOwnPortalConversation: (signal?: AbortSignal) =>
    apiRequest<PortalConversation>("/api/client-auth/chat/thread", { signal }),
  sendClientPortalMessage: (input: CreateClientPortalMessageInput) =>
    apiRequest<PortalConversation>("/api/client-auth/chat/messages", {
      method: "POST",
      body: input,
    }),
  listOwnPortalMeetings: (signal?: AbortSignal) =>
    apiRequest<PortalMeeting[]>("/api/client-auth/chat/meetings", { signal }),
  getOwnMeetingDetail: (meetingId: string, signal?: AbortSignal) =>
    apiRequest<PortalMeeting>(`/api/client-auth/chat/meetings/${meetingId}`, { signal }),
};
