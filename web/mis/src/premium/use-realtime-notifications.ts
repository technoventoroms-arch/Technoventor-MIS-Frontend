import { useEffect, useRef } from "react";
import { toast } from "sonner";

import type { Entity } from "@mono/api_client";
import type { ResourceState } from "./api-hooks";

const POLL_MS = 4000;

type NotificationRow = Entity & {
  id: number | string;
  title?: string;
  message?: string;
  type?: string;
  is_read?: boolean;
};

const TOAST_TYPES = new Set([
  "BOOKING_REQUEST",
  "BOOKING_APPROVED",
  "BOOKING_REJECTED",
  "BOOKING_CANCELLED",
  "INVENTORY_ALERT",
  "SLOT_OPEN",
]);

/**
 * Polls notifications REST API every few seconds (faster than legacy SSE) and toasts new items.
 */
export function useRealtimeNotifications(
  notifications: ResourceState<NotificationRow> | null,
  enabled: boolean
) {
  const seenIdsRef = useRef<Set<string>>(new Set());
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !notifications) {
      return;
    }

    const interval = window.setInterval(() => {
      void notifications.reload();
    }, POLL_MS);

    return () => window.clearInterval(interval);
  }, [enabled, notifications]);

  useEffect(() => {
    if (!enabled || !notifications) {
      return;
    }

    if (!bootstrappedRef.current) {
      for (const row of notifications.rows) {
        seenIdsRef.current.add(String(row.id));
      }
      bootstrappedRef.current = true;
      return;
    }

    for (const row of notifications.rows) {
      const id = String(row.id);
      if (seenIdsRef.current.has(id) || row.is_read) {
        continue;
      }
      seenIdsRef.current.add(id);
      const type = String(row.type ?? "");
      if (!TOAST_TYPES.has(type)) {
        continue;
      }
      toast.info(String(row.title ?? "Notification"), {
        description: String(row.message ?? ""),
      });
    }
  }, [enabled, notifications?.lastUpdatedAt, notifications?.rows]);
}
