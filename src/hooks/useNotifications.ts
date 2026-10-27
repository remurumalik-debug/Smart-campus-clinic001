"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  notificationType?: string;
  userRole?: string;
  link?: string;
  relatedAppointmentId?: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`/api/notifications?unread=${unreadOnly}`, { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      /* silent */
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const eventSource = new EventSource("/api/notifications/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "count") {
          setUnreadCount(data.unreadCount);
        } else if (data.kind === "notification") {
          fetchNotifications();
          setUnreadCount((prev) => prev + 1);
        } else if (data.kind === "appointment") {
          fetchNotifications();
        }
      } catch {
        /* silent */
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* silent */
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      /* silent */
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      /* silent */
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await fetch("/api/notifications?clearAll=true", { method: "DELETE" });
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      /* silent */
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
