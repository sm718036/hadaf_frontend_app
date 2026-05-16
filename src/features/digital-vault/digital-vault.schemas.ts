import { z } from "zod";

const documentRuleSchema = z.object({
  id: z.string().uuid(),
  countryId: z.string().uuid(),
  countryName: z.string(),
  visaCategoryId: z.string().uuid().nullable(),
  visaCategoryName: z.string().nullable(),
  documentTitle: z.string(),
  documentType: z.string(),
  minStudentAge: z.number().nullable(),
  maxStudentAge: z.number().nullable(),
  isRequired: z.boolean(),
  visibleToClient: z.boolean(),
  tracksExpiry: z.boolean(),
  expiryAlertMonths: z.number(),
  notes: z.string().nullable(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const digitalVaultSnapshotSchema = z.object({
  rules: z.array(documentRuleSchema),
});

export const upsertDocumentRuleSchema = z.object({
  id: z.string().uuid().optional(),
  countryId: z.string().uuid(),
  visaCategoryId: z.string().uuid().nullable(),
  documentTitle: z.string().trim().min(2).max(180),
  documentType: z.string().trim().min(2).max(120),
  minStudentAge: z.number().nullable(),
  maxStudentAge: z.number().nullable(),
  isRequired: z.boolean(),
  visibleToClient: z.boolean(),
  tracksExpiry: z.boolean(),
  expiryAlertMonths: z.number().int().min(1).max(24),
  notes: z.string().trim(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export type DigitalVaultSnapshot = z.infer<typeof digitalVaultSnapshotSchema>;
export type DocumentRule = z.infer<typeof documentRuleSchema>;
export type UpsertDocumentRuleInput = z.infer<typeof upsertDocumentRuleSchema>;
