import { apiRequest } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/pagination";
import type {
  Application,
  ApplicationDetail,
  MoveApplicationStageInput,
  UpsertApplicationInput,
} from "./applications.schemas";

export type ApplicationListFilters = {
  page: number;
  pageSize: number;
  search: string;
  country?: string;
  stage?: string;
  status?: string;
  staffId?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
};

type ApplicationsListResponse = PaginatedResponse<Application> & {
  filters: {
    country: string;
    stage: string;
    status: string;
    staffId: string;
    clientId: string;
    dateFrom: string;
    dateTo: string;
  };
  summary: {
    total: number;
    active: number;
    paused: number;
    approved: number;
    rejected: number;
    completed: number;
  };
};

function buildApplicationListQueryString(params: ApplicationListFilters) {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("pageSize", String(params.pageSize));

  if (params.search.trim()) query.set("search", params.search.trim());
  if (params.country?.trim()) query.set("country", params.country.trim());
  if (params.stage?.trim()) query.set("stage", params.stage.trim());
  if (params.status?.trim()) query.set("status", params.status.trim());
  if (params.staffId?.trim()) query.set("staffId", params.staffId.trim());
  if (params.clientId?.trim()) query.set("clientId", params.clientId.trim());
  if (params.dateFrom?.trim()) query.set("dateFrom", params.dateFrom.trim());
  if (params.dateTo?.trim()) query.set("dateTo", params.dateTo.trim());

  return query.toString();
}

export const applicationsService = {
  list: (params: ApplicationListFilters, signal?: AbortSignal) =>
    apiRequest<ApplicationsListResponse>(
      `/api/applications?${buildApplicationListQueryString(params)}`,
      { signal },
    ),
  getById: (id: string, signal?: AbortSignal) =>
    apiRequest<ApplicationDetail>(`/api/applications/${id}`, { signal }),
  upsert: (input: UpsertApplicationInput) =>
    apiRequest<Application>("/api/applications", { method: "POST", body: input }),
  moveStage: (id: string, input: MoveApplicationStageInput) =>
    apiRequest<Application>(`/api/applications/${id}/stage`, { method: "POST", body: input }),
  delete: (id: string) =>
    apiRequest<{ success: true }>(`/api/applications/${id}`, { method: "DELETE" }),
  listOwn: (signal?: AbortSignal) =>
    apiRequest<ApplicationDetail[]>("/api/client-auth/applications", { signal }),
};
