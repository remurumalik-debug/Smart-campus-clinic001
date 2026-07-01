"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import StaffPageLayout from "@/components/layout/StaffPageLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function StaffConsultationsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/appointments?status=approved&limit=50");
        if (res.ok) {
          const data = await res.json();
          setAppointments(data.appointments || []);
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <StaffPageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Consultations</h1>
          <p className="text-sm text-muted mt-1">Manage active consultations</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-10 h-10 text-muted/40 mx-auto mb-3" />
            <p className="text-sm text-muted">No active consultations</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {appointments.map((apt: any) => (
              <Card key={apt._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark">{apt.userName}</p>
                      <p className="text-sm text-muted">{apt.doctorName} - {apt.departmentName}</p>
                      <p className="text-xs text-muted mt-1">{apt.appointmentDate} at {apt.appointmentTime}</p>
                      {apt.symptoms && <p className="text-xs text-muted mt-1">"{apt.symptoms}"</p>}
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </StaffPageLayout>
  );
}
