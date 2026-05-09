import { z } from "zod";

const clientStatusSchema = z.enum(["active", "inactive", "completed", "rejected"]);
const applicationStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "completed",
]);

const clientSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  cnic: z.string().nullable(),
  passportNumber: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  address: z.string().nullable(),
  countryOfResidence: z.string().nullable(),
  targetCountry: z.string().nullable(),
  targetService: z.string().nullable(),
  educationLevel: z.string().nullable(),
  lastQualification: z.string().nullable(),
  assignedStaffUserId: z.string().uuid().nullable(),
  assignedStaffName: z.string().nullable(),
  status: clientStatusSchema,
  currentApplicationStatus: applicationStatusSchema,
  emergencyContact: z.string().nullable(),
  internalNotes: z.string().nullable(),
  sourceLeadId: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const clientDetailSchema = z.object({
  client: clientSchema,
});

const upsertClientSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(120, "Name must be 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Enter a valid email address.",
    ),
  phone: z.string().trim().max(30, "Phone must be 30 characters or fewer."),
  cnic: z.string().trim().max(40, "CNIC / National ID must be 40 characters or fewer."),
  passportNumber: z.string().trim().max(40, "Passport number must be 40 characters or fewer."),
  dateOfBirth: z.string().trim(),
  address: z.string().trim().max(300, "Address must be 300 characters or fewer."),
  countryOfResidence: z.string().trim().max(100, "Country of residence must be 100 characters or fewer."),
  targetCountry: z.string().trim().max(100, "Target country must be 100 characters or fewer."),
  targetService: z.string().trim().max(120, "Target service must be 120 characters or fewer."),
  educationLevel: z.string().trim().max(120, "Education level must be 120 characters or fewer."),
  lastQualification: z.string().trim().max(160, "Last qualification must be 160 characters or fewer."),
  assignedStaffUserId: z.string().uuid().nullable().optional(),
  status: clientStatusSchema,
  currentApplicationStatus: applicationStatusSchema,
  emergencyContact: z.string().trim().max(160, "Emergency contact must be 160 characters or fewer."),
  internalNotes: z.string().trim().max(4_000, "Internal notes must be 4000 characters or fewer."),
});

const updateOwnClientProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(120, "Name must be 120 characters or fewer."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Enter a valid email address.",
    ),
  phone: z.string().trim().max(30, "Phone must be 30 characters or fewer."),
  cnic: z.string().trim().max(40, "CNIC / National ID must be 40 characters or fewer."),
  passportNumber: z.string().trim().max(40, "Passport number must be 40 characters or fewer."),
  dateOfBirth: z.string().trim(),
  address: z.string().trim().max(300, "Address must be 300 characters or fewer."),
  countryOfResidence: z.string().trim().max(100, "Country of residence must be 100 characters or fewer."),
  emergencyContact: z.string().trim().max(160, "Emergency contact must be 160 characters or fewer."),
});

export type Client = z.infer<typeof clientSchema>;
export type ClientDetail = z.infer<typeof clientDetailSchema>;
export type UpsertClientInput = z.infer<typeof upsertClientSchema>;
