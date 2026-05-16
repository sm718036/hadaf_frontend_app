import { apiRequest } from "@/lib/api";
import type {
  AcademicEngineSnapshot,
  AcademicWorkspace,
  PartnerCampus,
  PartnerCourse,
  PartnerUniversity,
  UpsertPartnerCampusInput,
  UpsertPartnerCourseInput,
  UpsertPartnerUniversityInput,
} from "./academic-engine.schemas";

export const academicEngineService = {
  getSnapshot: (signal?: AbortSignal) =>
    apiRequest<AcademicEngineSnapshot>("/api/academic-engine", { signal }),
  getMetadata: (signal?: AbortSignal) =>
    apiRequest<AcademicEngineSnapshot>("/api/academic-engine/metadata", { signal }),
  saveUniversity: (input: UpsertPartnerUniversityInput) =>
    apiRequest<PartnerUniversity>("/api/academic-engine/universities", {
      method: "POST",
      body: input,
    }),
  saveCampus: (input: UpsertPartnerCampusInput) =>
    apiRequest<PartnerCampus>("/api/academic-engine/campuses", {
      method: "POST",
      body: input,
    }),
  saveCourse: (input: UpsertPartnerCourseInput) =>
    apiRequest<PartnerCourse>("/api/academic-engine/courses", {
      method: "POST",
      body: input,
    }),
  getWorkspace: (applicationId: string, signal?: AbortSignal) =>
    apiRequest<AcademicWorkspace>(`/api/applications/${applicationId}/academic-workspace`, {
      signal,
    }),
  saveSop: (applicationId: string, body: string) =>
    apiRequest<AcademicWorkspace>(`/api/applications/${applicationId}/sop`, {
      method: "POST",
      body: { body },
    }),
  addComment: (applicationId: string, body: string) =>
    apiRequest<AcademicWorkspace>(`/api/applications/${applicationId}/sop/comments`, {
      method: "POST",
      body: { body },
    }),
};
