"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Info, AlertCircle, CheckCircle, AlertTriangle, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const typeColors = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-muted hover:text-dark rounded-lg hover:bg-accent transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gray-50">
            <h3 className="text-sm font-semibold text-dark">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium cursor-pointer"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-muted/30 mx-auto mb-2" />
                <p className="text-xs text-muted">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const Icon = typeIcons[n.type] || Info;
                return (
                  <button
                    key={n._id}
                    onClick={() => {
                      if (!n.read) markAsRead(n._id);
                      if (n.link) window.location.href = n.link;
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-border/50 hover:bg-gray-50 transition-colors cursor-pointer",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", n.type === "info" && "bg-blue-100", n.type === "success" && "bg-emerald-100", n.type === "warning" && "bg-amber-100", n.type === "error" && "bg-red-100")}>
                        <Icon className={cn("w-3.5 h-3.5", n.type === "info" && "text-blue-600", n.type === "success" && "text-emerald-600", n.type === "warning" && "text-amber-600", n.type === "error" && "text-red-600")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark truncate">{n.title}</p>
                        <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted/60 mt-1">
                          {new Date(n.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
