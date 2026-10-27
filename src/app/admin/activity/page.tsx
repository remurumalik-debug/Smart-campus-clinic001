"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Search, GraduationCap, Stethoscope, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  appointment_booked: { label: "Booked Appointment", color: "bg-blue-50 text-blue-700" },
  appointment_cancelled: { label: "Cancelled Appointment", color: "bg-red-50 text-red-700" },
  appointment_approved: { label: "Approved Appointment", color: "bg-green-50 text-green-700" },
  appointment_rejected: { label: "Rejected Appointment", color: "bg-red-50 text-red-700" },
  appointment_completed: { label: "Completed Appointment", color: "bg-purple-50 text-purple-700" },
  student_registered: { label: "Student Registered", color: "bg-indigo-50 text-indigo-700" },
};

function getActionMeta(action: string) {
  return ACTION_LABELS[action] || { label: action.replace(/_/g, " "), color: "bg-gray-50 text-gray-600" };
}

function formatTime(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActivities = async (p = page) => {
    setLoading(true);
    try {
      let url = `/api/admin/activity?page=${p}&limit=50`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (e) {
      console.error("Failed to fetch activities", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const roleMeta = (role: string) => {
    if (role === "student") return { label: "Student", icon: <GraduationCap className="w-4 h-4 text-blue-600" />, bg: "bg-blue-100" };
    if (role === "clinic_staff") return { label: "Clinic Staff", icon: <Stethoscope className="w-4 h-4 text-purple-600" />, bg: "bg-purple-100" };
    return { label: "Admin", icon: <Shield className="w-4 h-4 text-amber-600" />, bg: "bg-amber-100" };
  };

  return (
    <AdminPageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Activity Oversight</h1>
          <p className="text-sm text-muted mt-1">Monitor all student and clinic staff activity</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") fetchActivities(1); }}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2">
            {["", "student", "clinic_staff", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[32px] ${
                  roleFilter === r ? "bg-primary text-white" : "bg-gray-100 text-muted hover:bg-gray-200"
                }`}
              >
                {r ? (r === "clinic_staff" ? "Staff" : r.charAt(0).toUpperCase() + r.slice(1)) : "All"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-10 h-10 text-muted/40 mx-auto mb-3" />
            <p className="text-sm text-muted">No activity recorded yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left py-3 px-4 text-muted font-medium">User</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Role</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Action</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Details</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((act: any) => {
                    const actionMeta = getActionMeta(act.action);
                    const role = roleMeta(act.actorRole);
                    return (
                      <tr key={act._id} className="border-b border-border/50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${role.bg}`}>
                              {role.icon}
                            </div>
                            <p className="font-medium text-dark">{act.actorName}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-muted">{role.label}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-md ${actionMeta.color}`}>{actionMeta.label}</span>
                        </td>
                        <td className="py-3 px-4 text-muted max-w-md">{act.description}</td>
                        <td className="py-3 px-4 text-muted whitespace-nowrap">{formatTime(act.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { const np = Math.max(1, page - 1); setPage(np); fetchActivities(np); }}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-border text-muted hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted">Page {page} of {totalPages}</span>
            <button
              onClick={() => { const np = Math.min(totalPages, page + 1); setPage(np); fetchActivities(np); }}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-border text-muted hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </AdminPageLayout>
  );
}
