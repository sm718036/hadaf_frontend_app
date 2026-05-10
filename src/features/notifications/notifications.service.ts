import { apiRequest } from "@/lib/api";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationFeed = {
  items: NotificationItem[];
  unreadCount: number;
};

export const notificationsService = {
  getInternalFeed: (signal?: AbortSignal) =>
    apiRequest<NotificationFeed>("/api/notifications", { signal }),
  getClientFeed: (signal?: AbortSignal) =>
    apiRequest<NotificationFeed>("/api/client-auth/notifications", { signal }),
  markInternalRead: (id: string) =>
    apiRequest<{ success: true }>(`/api/notifications/${id}/read`, { method: "POST" }),
  markClientRead: (id: string) =>
    apiRequest<{ success: true }>(`/api/client-auth/notifications/${id}/read`, { method: "POST" }),
  markAllInternalRead: () =>
    apiRequest<{ success: true }>("/api/notifications/read-all", { method: "POST" }),
  markAllClientRead: () =>
    apiRequest<{ success: true }>("/api/client-auth/notifications/read-all", { method: "POST" }),
};
