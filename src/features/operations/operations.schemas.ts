export const TASK_STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const DOCUMENT_STATUSES = ["requested", "received", "verified", "rejected"] as const;
export const DOCUMENT_REVIEW_STATUSES = ["pending", "accepted", "rejected", "expired"] as const;
export const APPOINTMENT_TYPES = [
  "consultation",
  "document_review",
  "interview_prep",
  "embassy",
  "follow_up",
  "other",
] as const;
export const APPOINTMENT_STATUSES = ["scheduled", "completed", "cancelled", "rescheduled"] as const;
export const PAYMENT_STATUSES = ["pending", "partial", "paid", "overdue", "cancelled"] as const;
export const OFFLINE_PAYMENT_MODES = ["cash", "wire", "pos"] as const;
export const CHAT_CONTACT_TYPES = ["app_user", "client"] as const;
export const MEETING_STATUSES = ["scheduled", "completed", "cancelled"] as const;
export const MEETING_TYPES = ["video_call", "phone_call", "in_person", "other"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
export type DocumentReviewStatus = (typeof DOCUMENT_REVIEW_STATUSES)[number];
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type OfflinePaymentMode = (typeof OFFLINE_PAYMENT_MODES)[number];
export type ChatContactType = (typeof CHAT_CONTACT_TYPES)[number];
export type MeetingStatus = (typeof MEETING_STATUSES)[number];
export type MeetingType = (typeof MEETING_TYPES)[number];

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignedStaffUserId: string | null;
  assignedStaffName: string | null;
  relatedClientId: string | null;
  relatedClientName: string | null;
  relatedLeadId: string | null;
  relatedApplicationId: string | null;
  createdByUserId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentRecord = {
  id: string;
  clientId: string;
  clientName: string;
  applicationId: string | null;
  checklistRuleId: string | null;
  title: string;
  documentType: string;
  status: DocumentStatus;
  reviewStatus: DocumentReviewStatus;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  contentType: string | null;
  notes: string | null;
  reviewNote: string | null;
  expiryDate: string | null;
  expiryAlertMonths: number | null;
  expiryAlertAt: string | null;
  isExpiryAlertDue: boolean;
  visibleToClient: boolean;
  uploadedByInternalUserId: string | null;
  uploadedByInternalName: string | null;
  uploadedByClientId: string | null;
  uploadedByClientName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Appointment = {
  id: string;
  clientId: string;
  clientName: string;
  applicationId: string | null;
  assignedStaffUserId: string | null;
  assignedStaffName: string | null;
  title: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: string;
  durationMinutes: number;
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  clientId: string;
  clientName: string;
  applicationId: string | null;
  title: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  milestoneLabel: string | null;
  contractTotal: number;
  amountReceived: number;
  balanceDue: number;
  paymentMode: OfflinePaymentMode | null;
  dueDate: string | null;
  paidAt: string | null;
  paymentMethod: string | null;
  referenceNumber: string | null;
  notes: string | null;
  feeLines: Array<{
    id: string;
    paymentId: string;
    feeItemId: string | null;
    label: string;
    amount: number;
    currency: string;
    displayOrder: number;
  }>;
  receipts: Array<{
    id: string;
    paymentId: string;
    amount: number;
    paymentMode: OfflinePaymentMode;
    receiptUrl: string;
    receiptFileName: string;
    receiptContentType: string;
    receivedAt: string;
    notes: string | null;
    loggedByUserId: string;
    loggedByName: string | null;
    createdAt: string;
  }>;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MessageRecord = {
  id: string;
  clientId: string;
  clientName: string;
  internalUserId: string | null;
  internalUserName: string | null;
  applicationId: string | null;
  senderType: "client" | "internal";
  senderClientId: string | null;
  senderClientName: string | null;
  senderInternalUserId: string | null;
  senderInternalUserName: string | null;
  body: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type ChatContact = {
  type: ChatContactType;
  id: string;
  name: string;
  email: string | null;
  roleLabel: string;
  subtitle: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
  lastActiveAt: string | null;
};

export type ChatThreadSummary = {
  threadId: string;
  contact: ChatContact;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type PortalChatMessage = {
  id: string;
  threadId: string;
  senderType: "internal" | "client";
  senderName: string;
  senderAppUserId: string | null;
  senderClientId: string | null;
  body: string;
  createdAt: string;
};

export type PortalConversation = {
  threadId: string;
  contact: ChatContact;
  messages: PortalChatMessage[];
};

export type PortalMeeting = {
  id: string;
  threadId: string;
  contact: ChatContact;
  hostAppUserId: string;
  title: string;
  notes: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: MeetingStatus;
  meetingType: MeetingType;
  roomName: string;
  joinPath: string;
  createdAt: string;
};

export type OperationsListResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type OperationsListFilters = {
  page: number;
  pageSize: number;
  search: string;
  status: string;
  clientId: string;
  applicationId: string;
  staffId: string;
};

export type UpsertTaskInput = {
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedStaffUserId: string | null;
  relatedClientId: string | null;
  relatedLeadId: string | null;
  relatedApplicationId: string | null;
};

export type UpsertDocumentInput = {
  id?: string;
  clientId: string;
  applicationId: string | null;
  checklistRuleId: string | null;
  title: string;
  documentType: string;
  status: DocumentStatus;
  reviewStatus: DocumentReviewStatus;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  contentType: string;
  notes: string;
  reviewNote: string;
  expiryDate: string;
  expiryAlertMonths: number | null;
  visibleToClient: boolean;
};

export type UpsertAppointmentInput = {
  id?: string;
  clientId: string;
  applicationId: string | null;
  assignedStaffUserId: string | null;
  title: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: string;
  durationMinutes: number;
  location: string;
  meetingLink: string;
  notes: string;
};

export type UpsertPaymentInput = {
  id?: string;
  clientId: string;
  applicationId: string | null;
  title: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  milestoneLabel: string;
  contractTotal: number;
  dueDate: string;
  paidAt: string;
  paymentMode: OfflinePaymentMode | null;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
  feeLines: Array<{
    id?: string;
    feeItemId: string | null;
    label: string;
    amount: number;
    currency: string;
    displayOrder: number;
  }>;
};

export type PaymentReceiptInput = {
  paymentId: string;
  amount: number;
  paymentMode: OfflinePaymentMode;
  receiptUrl: string;
  receiptFileName: string;
  receiptContentType: string;
  receivedAt: string;
  notes: string;
};

export type CreateMessageInput = {
  clientId: string;
  applicationId: string | null;
  body: string;
};

export type CreateClientMessageInput = {
  applicationId: string | null;
  body: string;
};

export type OpenThreadInput = {
  contactType: ChatContactType;
  contactId: string;
};

export type CreatePortalMessageInput = {
  contactType: ChatContactType;
  contactId: string;
  body: string;
};

export type CreateClientPortalMessageInput = {
  body: string;
};

export type CreateMeetingInput = {
  contactType: ChatContactType;
  contactId: string;
  title: string;
  notes: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingType: MeetingType;
};

export type CreateClientDocumentInput = {
  applicationId: string | null;
  checklistRuleId: string | null;
  title: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  contentType: string;
  notes: string;
};

export type UpdateMeetingStatusInput = {
  status: MeetingStatus;
};
