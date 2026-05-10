export const TASK_STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const DOCUMENT_STATUSES = ["requested", "received", "verified", "rejected"] as const;
export const APPOINTMENT_TYPES = [
  "consultation",
  "document_review",
  "interview_prep",
  "embassy",
  "follow_up",
  "other",
] as const;
export const APPOINTMENT_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
  "rescheduled",
] as const;
export const PAYMENT_STATUSES = ["pending", "partial", "paid", "overdue", "cancelled"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

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
  title: string;
  documentType: string;
  status: DocumentStatus;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  contentType: string | null;
  notes: string | null;
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
  dueDate: string | null;
  paidAt: string | null;
  paymentMethod: string | null;
  referenceNumber: string | null;
  notes: string | null;
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
  title: string;
  documentType: string;
  status: DocumentStatus;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  contentType: string;
  notes: string;
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
  dueDate: string;
  paidAt: string;
  paymentMethod: string;
  referenceNumber: string;
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

export type CreateClientDocumentInput = {
  applicationId: string | null;
  title: string;
  documentType: string;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  contentType: string;
  notes: string;
};
