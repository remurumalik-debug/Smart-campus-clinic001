"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Search } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import StaffPageLayout from "@/components/layout/StaffPageLayout";
import { toast } from "sonner";

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let url = "/api/admin/appointments?limit=100";
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      console.error("Failed to fetch appointments", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        toast.success(`Appointment ${status} successfully`);
        fetchAppointments();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update appointment");
      }
    } catch {
      toast.error("Failed to update appointment");
    }
  };

  return (
    <StaffPageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Appointments</h1>
          <p className="text-sm text-muted mt-1">View and manage patient appointments</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by patient or doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") fetchAppointments(); }}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
            {["", "pending", "approved", "rejected", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[32px] ${
                  statusFilter === s ? "bg-primary text-white" : "bg-gray-100 text-muted hover:bg-gray-200"
                }`}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarCheck className="w-10 h-10 text-muted/40 mx-auto mb-3" />
            <p className="text-sm text-muted">No appointments found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left py-3 px-4 text-muted font-medium">Patient</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Doctor</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Department</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt: any) => (
                  <tr key={apt._id} className="border-b border-border/50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-dark">{apt.userName}</p>
                    </td>
                    <td className="py-3 px-4 text-muted">{apt.doctorName}</td>
                    <td className="py-3 px-4 text-muted">{apt.departmentName}</td>
                    <td className="py-3 px-4 text-muted">{apt.appointmentDate}</td>
                    <td className="py-3 px-4 text-muted">{apt.appointmentTime}</td>
                    <td className="py-3 px-4"><StatusBadge status={apt.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {apt.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus(apt._id, "approved")} className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 cursor-pointer min-h-[32px]">Approve</button>
                            <button onClick={() => updateStatus(apt._id, "rejected")} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 cursor-pointer min-h-[32px]">Reject</button>
                          </>
                        )}
                        {apt.status === "approved" && (
                          <button onClick={() => updateStatus(apt._id, "completed")} className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 cursor-pointer min-h-[32px]">Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </motion.div>
    </StaffPageLayout>
  );
}
