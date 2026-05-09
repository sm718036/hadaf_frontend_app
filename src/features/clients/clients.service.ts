import type { UpsertClientInput } from "@/features/clients/clients.schemas";
import type { Client, ClientDetail } from "@/features/clients/clients.schemas";
import { apiRequest } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/pagination";

export type ClientsListResponse = PaginatedResponse<Client> & {
  filters: {
    status: string;
    country: string;
    targetCountry: string;
    targetService: string;
    staffId: string;
  };
  summary: {
    total: number;
    active: number;
    inactive: number;
    completed: number;
    rejected: number;
  };
};

export type ClientListFilters = {
  page: number;
  pageSize: number;
  search: string;
  status?: string;
  country?: string;
  targetCountry?: string;
  targetService?: string;
  staffId?: string;
};

function buildClientListQueryString(params: ClientListFilters) {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));

  if (params.search.trim()) query.set("search", params.search.trim());
  if (params.status?.trim()) query.set("status", params.status.trim());
  if (params.country?.trim()) query.set("country", params.country.trim());
  if (params.targetCountry?.trim()) query.set("targetCountry", params.targetCountry.trim());
  if (params.targetService?.trim()) query.set("targetService", params.targetService.trim());
  if (params.staffId?.trim()) query.set("staffId", params.staffId.trim());

  return query.toString();
}

export const clientsService = {
  getClients: (params: ClientListFilters, signal?: AbortSignal) =>
    apiRequest<ClientsListResponse>(`/api/clients?${buildClientListQueryString(params)}`, { signal }),
  getClientDetail: (id: string, signal?: AbortSignal) =>
    apiRequest<ClientDetail>(`/api/clients/${id}`, { signal }),
  upsertClient: (input: UpsertClientInput) =>
    apiRequest<Client>("/api/clients", { method: "POST", body: input }),
  deleteClient: (id: string) =>
    apiRequest<{ success: true }>(`/api/clients/${id}`, { method: "DELETE" }),
};
