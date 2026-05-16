import { z } from "zod";

const feeItemSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  code: z.string(),
  defaultAmount: z.number(),
  currency: z.string(),
  notes: z.string().nullable(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const financialLedgerSnapshotSchema = z.object({
  feeItems: z.array(feeItemSchema),
  universityCommissions: z.array(
    z.object({
      universityId: z.string().uuid(),
      universityName: z.string(),
      countryName: z.string(),
      commissionPercentage: z.number(),
    }),
  ),
  commissionPayouts: z.array(
    z.object({
      applicationId: z.string().uuid(),
      clientName: z.string(),
      universityName: z.string(),
      commissionPercentage: z.number(),
      expectedPayout: z.number(),
      basisAmount: z.number(),
    }),
  ),
});

export const upsertFeeItemSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(2).max(160),
  code: z.string().trim().min(2).max(60),
  defaultAmount: z.number().min(0),
  currency: z.string().trim().toUpperCase().min(3).max(8),
  notes: z.string().trim(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export type FeeItem = z.infer<typeof feeItemSchema>;
export type FinancialLedgerSnapshot = z.infer<typeof financialLedgerSnapshotSchema>;
export type UpsertFeeItemInput = z.infer<typeof upsertFeeItemSchema>;
