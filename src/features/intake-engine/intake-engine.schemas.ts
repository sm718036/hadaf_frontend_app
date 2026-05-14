import { z } from "zod";

const intakeAnswerOptionSchema = z.object({
  id: z.string().uuid(),
  questionId: z.string().uuid(),
  label: z.string(),
  valueKey: z.string(),
  weight: z.number(),
  isDisqualifying: z.boolean(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const intakeQuestionSchema = z.object({
  id: z.string().uuid(),
  prompt: z.string(),
  helpText: z.string().nullable(),
  inputType: z.enum(["single_select", "boolean"]),
  countryConfigurationId: z.string().uuid().nullable(),
  countryName: z.string().nullable(),
  visaCategoryId: z.string().uuid().nullable(),
  visaCategoryName: z.string().nullable(),
  isRequired: z.boolean(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  answerOptions: z.array(intakeAnswerOptionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publicLeadIntakeMetadataSchema = z.object({
  countries: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      baseCurrency: z.string(),
    }),
  ),
  visaCategories: z.array(
    z.object({
      id: z.string().uuid(),
      countryId: z.string().uuid(),
      name: z.string(),
      code: z.string(),
    }),
  ),
  questions: z.array(intakeQuestionSchema),
});

export const intakeAnswerInputSchema = z.object({
  questionId: z.string().uuid(),
  optionId: z.string().uuid(),
});

export const upsertIntakeQuestionSchema = z.object({
  id: z.string().uuid().optional(),
  prompt: z.string().trim().min(2).max(240),
  helpText: z.string().trim(),
  inputType: z.enum(["single_select", "boolean"]),
  countryConfigurationId: z.string().uuid().nullable(),
  visaCategoryId: z.string().uuid().nullable(),
  isRequired: z.boolean(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
  answerOptions: z.array(
    z.object({
      id: z.string().uuid().optional(),
      label: z.string().trim().min(1).max(160),
      valueKey: z.string().trim().min(1).max(80),
      weight: z.number(),
      isDisqualifying: z.boolean(),
      displayOrder: z.number().int().min(0),
      isActive: z.boolean(),
    }),
  ).min(2),
});

export type PublicLeadIntakeMetadata = z.infer<typeof publicLeadIntakeMetadataSchema>;
export type IntakeQuestion = z.infer<typeof intakeQuestionSchema>;
export type IntakeAnswerInput = z.infer<typeof intakeAnswerInputSchema>;
export type UpsertIntakeQuestionInput = z.infer<typeof upsertIntakeQuestionSchema>;
