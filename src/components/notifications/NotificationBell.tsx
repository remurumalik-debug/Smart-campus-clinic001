"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, Check, Trash2, X, AlertTriangle, Info, CheckCircle, ChevronRight } from "lucide-react";
import { useNotifications, NotificationItem } from "@/hooks/useNotifications";
import { timeAgo } from "@/lib/utils";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  error: <AlertTriangle className="w-4 h-4 text-red-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
};

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const prevCount = useRef(unreadCount);

  // Animate bell on new notification
  useEffect(() => {
    if (unreadCount > prevCount.current) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 600);
    }
    prevCount.current = unreadCount;
  }, [unreadCount]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = useCallback(async (n: NotificationItem) => {
    if (!n.read) await markAsRead(n._id);
    if (n.link) window.location.href = n.link;
  }, [markAsRead]);

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={() => setOpen((prev) => !prev)}
        className={`relative p-2 rounded-lg transition-all duration-200 cursor-pointer bg-transparent border-none hover:bg-gray-100 ${animating ? "animate-bell" : ""}`}
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${animating ? "scale-110" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[70vh] flex flex-col animate-dropdown"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
            <h3 className="text-sm font-semibold text-dark">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleOpen(n)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 group ${
                      !n.read ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {TYPE_ICONS[n.type] || TYPE_ICONS.info}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.read ? "font-semibold text-dark" : "font-medium text-gray-700"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                          className="p-1 rounded hover:bg-blue-100 text-blue-500 cursor-pointer bg-transparent border-none"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                        className="p-1 rounded hover:bg-red-100 text-red-400 cursor-pointer bg-transparent border-none"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bellshake {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(12deg); }
          30% { transform: rotate(-12deg); }
          45% { transform: rotate(8deg); }
          60% { transform: rotate(-8deg); }
          75% { transform: rotate(4deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-bell {
          animation: bellshake 0.6s ease-in-out;
        }
        @keyframes dropdown {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-dropdown {
          animation: dropdown 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}
