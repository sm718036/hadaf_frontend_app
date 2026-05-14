import { apiRequest } from "@/lib/api";
import type { IntakeQuestion, PublicLeadIntakeMetadata, UpsertIntakeQuestionInput } from "./intake-engine.schemas";

export const intakeEngineService = {
  getPublicMetadata: (signal?: AbortSignal) =>
    apiRequest<PublicLeadIntakeMetadata>("/api/public/lead-intake", { signal }),
  listQuestions: (signal?: AbortSignal) =>
    apiRequest<IntakeQuestion[]>("/api/intake-engine/questions", { signal }),
  saveQuestion: (input: UpsertIntakeQuestionInput) =>
    apiRequest<IntakeQuestion>("/api/intake-engine/questions", { method: "POST", body: input }),
};
