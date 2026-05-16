import { apiRequest } from "@/lib/api";
import type { FeeItem, FinancialLedgerSnapshot, UpsertFeeItemInput } from "./financial-ledger.schemas";

export const financialLedgerService = {
  getSnapshot: (signal?: AbortSignal) =>
    apiRequest<FinancialLedgerSnapshot>("/api/financial-ledger", { signal }),
  saveFeeItem: (input: UpsertFeeItemInput) =>
    apiRequest<FeeItem>("/api/financial-ledger/fee-items", { method: "POST", body: input }),
};
