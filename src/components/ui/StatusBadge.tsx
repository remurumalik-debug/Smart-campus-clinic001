"use client";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", classes: "bg-red-50 text-red-700 border-red-200" },
  completed: { label: "Completed", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  cancelled: { label: "Cancelled", classes: "bg-gray-50 text-gray-700 border-gray-200" },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
