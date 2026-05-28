import { endpoints, tokenStorage } from "@mono/api_client";

function buildNotificationStreamUrl() {
  const baseUrl = import.meta.env.VITE_PUBLIC_API_ENDPOINT ?? "/api/v1/";
  const normalized = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  if (normalized.endsWith("/api/v1/")) {
    return `${normalized}${endpoints.users.notificationStream}`;
  }
  return `${normalized}api/v1/${endpoints.users.notificationStream}`;
}

export const getNotifications = async () => {
  const token = tokenStorage.read()?.access;
  return fetch(buildNotificationStreamUrl(), {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};
