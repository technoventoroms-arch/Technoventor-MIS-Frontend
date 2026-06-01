import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { tokenStorage } from "@mono/api_client";
import type { ResourceState } from "./api-hooks";

const TOAST_TYPES = new Set([
  "BOOKING_REQUEST",
  "BOOKING_APPROVED",
  "BOOKING_REJECTED",
  "BOOKING_CANCELLED",
  "INVENTORY_ALERT",
  "SLOT_OPEN",
  "ORG_INVITATION",
  "JOIN_REQUEST",
]);

function buildWebSocketUrl(): string | null {
  const token = tokenStorage.read()?.access;
  if (!token) return null;

  const apiBase = import.meta.env.VITE_PUBLIC_API_ENDPOINT ?? "/api/v1/";
  let wsOrigin: string;
  try {
    const parsed = new URL(apiBase, window.location.origin);
    wsOrigin = `${parsed.protocol === "https:" ? "wss:" : "ws:"}//${parsed.host}`;
  } catch {
    wsOrigin = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
  }

  const path = apiBase.includes("/api/v1") ? "/ws/notifications/" : "/api/v1/ws/notifications/";
  return `${wsOrigin}${path}?token=${encodeURIComponent(token)}`;
}

/**
 * Real-time notifications via WebSocket (replaces 4s polling).
 */
export function useNotificationWebSocket(
  notifications: ResourceState<{ id: number | string; type?: string; title?: string; message?: string }> | null,
  enabled: boolean
) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !notifications) {
      return;
    }

    function connect() {
      const url = buildWebSocketUrl();
      if (!url) return;

      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as {
            type?: string;
            title?: string;
            message?: string;
          };
          if (payload.type === "connected") {
            return;
          }
          const nType = String(payload.type ?? "");
          if (TOAST_TYPES.has(nType)) {
            toast.info(String(payload.title ?? "Notification"), {
              description: String(payload.message ?? ""),
            });
          }
          void notifications?.reload();
        } catch {
          /* ignore malformed frames */
        }
      };

      socket.onclose = () => {
        reconnectTimer.current = window.setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimer.current) {
        window.clearTimeout(reconnectTimer.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [enabled, notifications]);
}
