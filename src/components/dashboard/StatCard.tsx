"use client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: "primary" | "blue" | "amber" | "purple";
}

const colors = {
  primary: "bg-primary/10 text-primary",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  purple: "bg-purple-50 text-purple-600",
};

export function StatCard({ label, value, icon, trend, color = "primary" }: StatCardProps) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-card hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted font-medium">{label}</span>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", colors[color])}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-dark">{value}</span>
        {trend && <span className="text-xs text-emerald-600 mb-1">{trend}</span>}
      </div>
    </div>
  );
}
