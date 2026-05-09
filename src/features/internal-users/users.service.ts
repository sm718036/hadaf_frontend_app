import { apiRequest } from "@/lib/api";
import { buildListQueryString, type ListQueryParams, type PaginatedResponse } from "@/lib/pagination";
import type {
  CreateInternalUserInput,
  InternalUser,
  UpdateInternalUserInput,
} from "./users.schemas";

type InternalUsersListResponse = PaginatedResponse<InternalUser>;

export const usersService = {
  list: (params: ListQueryParams, signal?: AbortSignal) =>
    apiRequest<InternalUsersListResponse>(`/api/users?${buildListQueryString(params)}`, { signal }),
  create: (input: CreateInternalUserInput) =>
    apiRequest<InternalUser>("/api/users", { method: "POST", body: input }),
  update: (id: string, input: UpdateInternalUserInput) =>
    apiRequest<InternalUser>(`/api/users/${id}`, { method: "PUT", body: input }),
  delete: (id: string) =>
    apiRequest<{ success: true }>(`/api/users/${id}`, { method: "DELETE" }),
};
