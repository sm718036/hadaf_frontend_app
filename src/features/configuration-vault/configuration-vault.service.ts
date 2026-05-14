import { apiRequest } from "@/lib/api";
import type {
  ConfigurationVaultMetadata,
  ConfigurationVaultSnapshot,
  UpsertVaultCountryInput,
  UpsertVaultDocumentChecklistInput,
  UpsertVaultFinancialRuleInput,
  UpsertVaultVisaCategoryInput,
  UpsertVaultWorkflowStageInput,
  VaultCountry,
  VaultDocumentChecklist,
  VaultFinancialRule,
  VaultVisaCategory,
  VaultWorkflowStage,
} from "./configuration-vault.schemas";

export const configurationVaultService = {
  getMetadata: (signal?: AbortSignal) =>
    apiRequest<ConfigurationVaultMetadata>("/api/configuration-vault/metadata", { signal }),
  getSnapshot: (signal?: AbortSignal) =>
    apiRequest<ConfigurationVaultSnapshot>("/api/configuration-vault", { signal }),
  saveCountry: (input: UpsertVaultCountryInput) =>
    apiRequest<VaultCountry>("/api/configuration-vault/countries", { method: "POST", body: input }),
  saveVisaCategory: (input: UpsertVaultVisaCategoryInput) =>
    apiRequest<VaultVisaCategory>("/api/configuration-vault/visa-categories", {
      method: "POST",
      body: input,
    }),
  saveWorkflowStage: (input: UpsertVaultWorkflowStageInput) =>
    apiRequest<VaultWorkflowStage>("/api/configuration-vault/workflow-stages", {
      method: "POST",
      body: input,
    }),
  saveDocumentChecklist: (input: UpsertVaultDocumentChecklistInput) =>
    apiRequest<VaultDocumentChecklist>("/api/configuration-vault/document-checklists", {
      method: "POST",
      body: input,
    }),
  saveFinancialRule: (input: UpsertVaultFinancialRuleInput) =>
    apiRequest<VaultFinancialRule>("/api/configuration-vault/financial-rules", {
      method: "POST",
      body: input,
    }),
};
