import { z } from "zod";

const intakeAnswerSchema = z.object({
  questionId: z.string().uuid(),
  optionId: z.string().uuid(),
});

const leadSourceSchema = z.enum([
  "website",
  "whatsapp",
  "referral",
  "social_media",
  "walk_in",
  "other",
]);

const leadStatusSchema = z.enum(["new", "contacted", "qualified", "converted", "lost"]);

const leadSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  interestedCountryConfigurationId: z.string().uuid().nullable(),
  interestedCountry: z.string().nullable(),
  interestedVisaCategoryId: z.string().uuid().nullable(),
  interestedService: z.string().nullable(),
  message: z.string().nullable(),
  intakeAnswers: z.array(
    z.object({
      questionId: z.string().uuid(),
      questionPrompt: z.string(),
      optionId: z.string().uuid(),
      optionLabel: z.string(),
      optionValueKey: z.string(),
      weight: z.number(),
      isDisqualifying: z.boolean(),
    }),
  ),
  qualificationScore: z.number(),
  source: leadSourceSchema,
  status: leadStatusSchema,
  assignedStaffUserId: z.string().uuid().nullable(),
  assignedStaffName: z.string().nullable(),
  autoAssignedByRouting: z.boolean(),
  nextFollowUpDate: z.string().nullable(),
  internalNotes: z.string().nullable(),
  convertedClientId: z.string().uuid().nullable(),
  convertedAt: z.string().nullable(),
  createdByUserId: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const leadHistorySchema = z.object({
  id: z.string().uuid(),
  actorType: z.enum(["system", "user"]),
  actorUserId: z.string().uuid().nullable(),
  actorName: z.string().nullable(),
  actionType: z.string(),
  description: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

const leadDetailSchema = z.object({
  lead: leadSchema,
  history: z.array(leadHistorySchema),
});

const upsertLeadSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30),
  email: z.string().trim().toLowerCase(),
  interestedCountryConfigurationId: z.string().uuid().nullable().optional(),
  interestedCountry: z.string().trim().max(100),
  interestedVisaCategoryId: z.string().uuid().nullable().optional(),
  interestedService: z.string().trim().max(120),
  message: z.string().trim().max(2000),
  intakeAnswers: z.array(intakeAnswerSchema).default([]),
  source: leadSourceSchema,
  status: leadStatusSchema,
  assignedStaffUserId: z.string().uuid().nullable().optional(),
  nextFollowUpDate: z.string().trim().optional().default(""),
  internalNotes: z.string().trim().max(4000),
  allowDuplicate: z.boolean().optional(),
});

const publicLeadSubmissionSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30),
  email: z.string().trim().toLowerCase(),
  interestedCountryConfigurationId: z.string().uuid().nullable().optional(),
  interestedCountry: z.string().trim().max(100),
  interestedVisaCategoryId: z.string().uuid().nullable().optional(),
  interestedService: z.string().trim().max(120),
  message: z.string().trim().max(2000),
  intakeAnswers: z.array(intakeAnswerSchema).default([]),
  formName: z.string().trim().max(80).optional(),
});

const convertLeadSchema = z.object({
  notes: z.string().trim().max(2000).optional().default(""),
});

export type Lead = z.infer<typeof leadSchema>;
export type LeadDetail = z.infer<typeof leadDetailSchema>;
export type LeadStatus = z.infer<typeof leadStatusSchema>;
export type LeadSource = z.infer<typeof leadSourceSchema>;
export type UpsertLeadInput = z.infer<typeof upsertLeadSchema>;
export type PublicLeadSubmissionInput = z.infer<typeof publicLeadSubmissionSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
