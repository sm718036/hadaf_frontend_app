import { apiRequest } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/pagination";
import type { ConvertLeadInput, Lead, LeadDetail, PublicLeadSubmissionInput, UpsertLeadInput } from "./leads.schemas";

export type LeadListFilters = {
  page: number;
  pageSize: number;
  search: string;
  status?: string;
  country?: string;
  service?: string;
  staffId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type LeadsListResponse = PaginatedResponse<Lead> & {
  filters: {
    status: string;
    country: string;
    service: string;
    staffId: string;
    dateFrom: string;
    dateTo: string;
  };
  summary: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    lost: number;
  };
};

function buildLeadListQueryString(params: LeadListFilters) {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));

  if (params.search.trim()) query.set("search", params.search.trim());
  if (params.status?.trim()) query.set("status", params.status.trim());
  if (params.country?.trim()) query.set("country", params.country.trim());
  if (params.service?.trim()) query.set("service", params.service.trim());
  if (params.staffId?.trim()) query.set("staffId", params.staffId.trim());
  if (params.dateFrom?.trim()) query.set("dateFrom", params.dateFrom.trim());
  if (params.dateTo?.trim()) query.set("dateTo", params.dateTo.trim());

  return query.toString();
}

export const leadsService = {
  list: (params: LeadListFilters, signal?: AbortSignal) =>
    apiRequest<LeadsListResponse>(`/api/leads?${buildLeadListQueryString(params)}`, { signal }),
  getById: (id: string, signal?: AbortSignal) => apiRequest<LeadDetail>(`/api/leads/${id}`, { signal }),
  upsert: (input: UpsertLeadInput) => apiRequest<Lead>("/api/leads", { method: "POST", body: input }),
  convert: (id: string, input: ConvertLeadInput) =>
    apiRequest<{ lead: Lead; client: { id: string; name: string } }>(`/api/leads/${id}/convert`, {
      method: "POST",
      body: input,
    }),
  delete: (id: string) => apiRequest<{ success: true }>(`/api/leads/${id}`, { method: "DELETE" }),
  submitPublicLead: (input: PublicLeadSubmissionInput) =>
    apiRequest<Lead>("/api/public/leads", { method: "POST", body: input }),
};
