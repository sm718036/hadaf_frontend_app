import { apiRequest } from "@/lib/api";
import type {
  DigitalVaultSnapshot,
  DocumentRule,
  UpsertDocumentRuleInput,
} from "./digital-vault.schemas";

export const digitalVaultService = {
  getSnapshot: (signal?: AbortSignal) => apiRequest<DigitalVaultSnapshot>("/api/digital-vault", { signal }),
  saveRule: (input: UpsertDocumentRuleInput) =>
    apiRequest<DocumentRule>("/api/digital-vault/rules", { method: "POST", body: input }),
};
