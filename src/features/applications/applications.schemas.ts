import { z } from "zod";

export const APPLICATION_STAGES = [
  "Inquiry received",
  "Consultation booked",
  "Eligibility checked",
  "Documents requested",
  "Documents received",
  "University shortlisting",
  "Application submitted",
  "Offer letter received",
  "Visa documents prepared",
  "Embassy appointment booked",
  "Visa submitted",
  "Approved",
  "Rejected",
  "Deferred",
] as const;

const applicationStageSchema = z.enum(APPLICATION_STAGES);
const applicationStatusSchema = z.enum(["active", "paused", "approved", "rejected", "completed"]);
const applicationPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

const applicationSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  clientName: z.string(),
  clientEmail: z.string().nullable(),
  clientPhone: z.string().nullable(),
  targetCountry: z.string(),
  serviceType: z.string(),
  universityProgram: z.string().nullable(),
  assignedStaffUserId: z.string().uuid().nullable(),
  assignedStaffName: z.string().nullable(),
  currentStage: applicationStageSchema,
  status: applicationStatusSchema,
  priority: applicationPrioritySchema,
  deadline: z.string().nullable(),
  notes: z.string().nullable(),
  createdByUserId: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  progressPercent: z.number(),
  isOverdue: z.boolean(),
});

const applicationStageHistorySchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  oldStage: applicationStageSchema.nullable(),
  newStage: applicationStageSchema,
  changedByUserId: z.string().uuid().nullable(),
  changedByName: z.string().nullable(),
  note: z.string().nullable(),
  changedAt: z.string(),
});

const applicationDetailSchema = z.object({
  application: applicationSchema,
  history: z.array(applicationStageHistorySchema),
});

const upsertApplicationSchema = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string().uuid("Select a valid client."),
  targetCountry: z.string().trim().min(2).max(100),
  serviceType: z.string().trim().min(2).max(120),
  universityProgram: z.string().trim().max(160),
  assignedStaffUserId: z.string().uuid().nullable().optional(),
  currentStage: applicationStageSchema,
  status: applicationStatusSchema,
  priority: applicationPrioritySchema,
  deadline: z.string().trim(),
  notes: z.string().trim().max(4000),
  historyNote: z.string().trim().max(2000).optional().default(""),
});

const moveApplicationStageSchema = z.object({
  direction: z.enum(["next", "previous"]),
  note: z.string().trim().max(2000).optional().default(""),
});

export type Application = z.infer<typeof applicationSchema>;
export type ApplicationDetail = z.infer<typeof applicationDetailSchema>;
export type ApplicationStageHistory = z.infer<typeof applicationStageHistorySchema>;
export type UpsertApplicationInput = z.infer<typeof upsertApplicationSchema>;
export type MoveApplicationStageInput = z.infer<typeof moveApplicationStageSchema>;
