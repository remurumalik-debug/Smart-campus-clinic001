"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, CalendarDays, X, Clock } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StudentPageLayout from "@/components/layout/StudentPageLayout";

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAppointments = useCallback(async () => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    setLoading(true);
    try {
      let url = `/api/appointments?userId=${userId}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch appointments", e);
    }
    setLoading(false);
  }, [session, statusFilter, search]);

  useEffect(() => {
    if (!session?.user) return;
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await fetch(`/api/appointments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "cancelled" }),
      });
      fetchAppointments();
    } catch (e) {
      console.error("Failed to cancel appointment", e);
    }
  };

  if (!session) return null;

  const filtered = Array.isArray(appointments) ? appointments.filter((a) =>
    !search || a.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
    a.departmentName?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <StudentPageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark">My Appointments</h1>
            <p className="text-sm text-muted">View and manage your clinic appointments</p>
          </div>
          <Link href="/booking">
            <Button><CalendarDays className="w-4 h-4" /> Book New</Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by doctor or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
            {["", "pending", "approved", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[32px] ${
                  statusFilter === s
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-muted hover:bg-gray-200"
                }`}
              >
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarDays className="w-10 h-10 text-muted/40 mx-auto mb-3" />
                <p className="text-sm text-muted">No appointments found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((apt: any) => (
                  <div key={apt._id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <CalendarDays className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-dark">{apt.doctorName}</p>
                          <p className="text-sm text-muted">{apt.departmentName}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {apt.appointmentDate}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.appointmentTime}</span>
                          </div>
                          {apt.symptoms && (
                            <p className="text-xs text-muted mt-1">"{apt.symptoms}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={apt.status} />
                        {(apt.status === "pending" || apt.status === "approved") && (
                          <button
                            onClick={() => handleCancel(apt._id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Cancel appointment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </StudentPageLayout>
  );
}
