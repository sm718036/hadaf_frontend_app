import { z } from "zod";

const vaultCountrySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isoCode: z.string(),
  baseCurrency: z.string(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const vaultVisaCategorySchema = z.object({
  id: z.string().uuid(),
  countryId: z.string().uuid(),
  countryName: z.string(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const vaultWorkflowStageSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const vaultDocumentChecklistSchema = z.object({
  id: z.string().uuid(),
  countryId: z.string().uuid(),
  countryName: z.string(),
  visaCategoryId: z.string().uuid().nullable(),
  visaCategoryName: z.string().nullable(),
  title: z.string(),
  notes: z.string().nullable(),
  isRequired: z.boolean(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const vaultFinancialRuleSchema = z.object({
  id: z.string().uuid(),
  countryId: z.string().uuid(),
  countryName: z.string(),
  visaCategoryId: z.string().uuid().nullable(),
  visaCategoryName: z.string().nullable(),
  label: z.string(),
  amount: z.number(),
  currency: z.string(),
  notes: z.string().nullable(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const configurationVaultSnapshotSchema = z.object({
  countries: z.array(vaultCountrySchema),
  visaCategories: z.array(vaultVisaCategorySchema),
  workflowStages: z.array(vaultWorkflowStageSchema),
  documentChecklists: z.array(vaultDocumentChecklistSchema),
  financialRules: z.array(vaultFinancialRuleSchema),
});

export const configurationVaultMetadataSchema = z.object({
  countries: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      isoCode: z.string(),
      baseCurrency: z.string(),
      displayOrder: z.number(),
    }),
  ),
  visaCategories: z.array(
    z.object({
      id: z.string().uuid(),
      countryId: z.string().uuid(),
      name: z.string(),
      code: z.string(),
      description: z.string().nullable(),
      displayOrder: z.number(),
    }),
  ),
  workflowStages: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string().nullable(),
      displayOrder: z.number(),
    }),
  ),
});

export const upsertVaultCountrySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(100),
  isoCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2,3}$/),
  baseCurrency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export const upsertVaultVisaCategorySchema = z.object({
  id: z.string().uuid().optional(),
  countryId: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(40),
  description: z.string().trim(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export const upsertVaultWorkflowStageSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export const upsertVaultDocumentChecklistSchema = z.object({
  id: z.string().uuid().optional(),
  countryId: z.string().uuid(),
  visaCategoryId: z.string().uuid().nullable(),
  title: z.string().trim().min(2).max(160),
  notes: z.string().trim(),
  isRequired: z.boolean(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export const upsertVaultFinancialRuleSchema = z.object({
  id: z.string().uuid().optional(),
  countryId: z.string().uuid(),
  visaCategoryId: z.string().uuid().nullable(),
  label: z.string().trim().min(2).max(160),
  amount: z.number().min(0),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  notes: z.string().trim(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export type ConfigurationVaultSnapshot = z.infer<typeof configurationVaultSnapshotSchema>;
export type ConfigurationVaultMetadata = z.infer<typeof configurationVaultMetadataSchema>;
export type VaultCountry = z.infer<typeof vaultCountrySchema>;
export type VaultVisaCategory = z.infer<typeof vaultVisaCategorySchema>;
export type VaultWorkflowStage = z.infer<typeof vaultWorkflowStageSchema>;
export type VaultDocumentChecklist = z.infer<typeof vaultDocumentChecklistSchema>;
export type VaultFinancialRule = z.infer<typeof vaultFinancialRuleSchema>;
export type UpsertVaultCountryInput = z.infer<typeof upsertVaultCountrySchema>;
export type UpsertVaultVisaCategoryInput = z.infer<typeof upsertVaultVisaCategorySchema>;
export type UpsertVaultWorkflowStageInput = z.infer<typeof upsertVaultWorkflowStageSchema>;
export type UpsertVaultDocumentChecklistInput = z.infer<typeof upsertVaultDocumentChecklistSchema>;
export type UpsertVaultFinancialRuleInput = z.infer<typeof upsertVaultFinancialRuleSchema>;
