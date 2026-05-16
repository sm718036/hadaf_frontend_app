import { z } from "zod";

const partnerUniversitySchema = z.object({
  id: z.string().uuid(),
  countryId: z.string().uuid(),
  countryName: z.string(),
  name: z.string(),
  websiteUrl: z.string().nullable(),
  commissionPercentage: z.number(),
  notes: z.string().nullable(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const partnerCampusSchema = z.object({
  id: z.string().uuid(),
  universityId: z.string().uuid(),
  universityName: z.string(),
  countryId: z.string().uuid(),
  name: z.string(),
  city: z.string().nullable(),
  notes: z.string().nullable(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const partnerCourseSchema = z.object({
  id: z.string().uuid(),
  campusId: z.string().uuid(),
  campusName: z.string(),
  universityId: z.string().uuid(),
  universityName: z.string(),
  countryId: z.string().uuid(),
  visaCategoryId: z.string().uuid().nullable(),
  visaCategoryName: z.string().nullable(),
  name: z.string(),
  awardLevel: z.string().nullable(),
  ieltsFloor: z.number().nullable(),
  gpaFloor: z.number().nullable(),
  notes: z.string().nullable(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const academicEngineSnapshotSchema = z.object({
  universities: z.array(partnerUniversitySchema),
  campuses: z.array(partnerCampusSchema),
  courses: z.array(partnerCourseSchema),
});

export const academicWorkspaceSchema = z.object({
  draft: z
    .object({
      id: z.string().uuid(),
      applicationId: z.string().uuid(),
      body: z.string(),
      updatedByUserId: z.string().uuid().nullable(),
      updatedByName: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })
    .nullable(),
  comments: z.array(
    z.object({
      id: z.string().uuid(),
      applicationId: z.string().uuid(),
      authorUserId: z.string().uuid(),
      authorName: z.string().nullable(),
      body: z.string(),
      createdAt: z.string(),
    }),
  ),
});

export const upsertPartnerUniversitySchema = z.object({
  id: z.string().uuid().optional(),
  countryId: z.string().uuid(),
  name: z.string().trim().min(2).max(180),
  websiteUrl: z.string().trim(),
  commissionPercentage: z.number().min(0).max(100),
  notes: z.string().trim(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export const upsertPartnerCampusSchema = z.object({
  id: z.string().uuid().optional(),
  universityId: z.string().uuid(),
  name: z.string().trim().min(2).max(180),
  city: z.string().trim(),
  notes: z.string().trim(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export const upsertPartnerCourseSchema = z.object({
  id: z.string().uuid().optional(),
  campusId: z.string().uuid(),
  visaCategoryId: z.string().uuid().nullable(),
  name: z.string().trim().min(2).max(180),
  awardLevel: z.string().trim(),
  ieltsFloor: z.number().nullable(),
  gpaFloor: z.number().nullable(),
  notes: z.string().trim(),
  displayOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

export type PartnerUniversity = z.infer<typeof partnerUniversitySchema>;
export type PartnerCampus = z.infer<typeof partnerCampusSchema>;
export type PartnerCourse = z.infer<typeof partnerCourseSchema>;
export type AcademicEngineSnapshot = z.infer<typeof academicEngineSnapshotSchema>;
export type AcademicWorkspace = z.infer<typeof academicWorkspaceSchema>;
export type UpsertPartnerUniversityInput = z.infer<typeof upsertPartnerUniversitySchema>;
export type UpsertPartnerCampusInput = z.infer<typeof upsertPartnerCampusSchema>;
export type UpsertPartnerCourseInput = z.infer<typeof upsertPartnerCourseSchema>;
