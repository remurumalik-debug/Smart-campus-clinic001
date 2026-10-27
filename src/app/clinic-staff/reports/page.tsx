"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, CalendarCheck, Users, Clock } from "lucide-react";
import StaffPageLayout from "@/components/layout/StaffPageLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function StaffReportsPage() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/dashboard?staff=true");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || {});
        }
      } catch (e) {
        console.error("Failed to fetch reports", e);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <StaffPageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Reports</h1>
          <p className="text-sm text-muted mt-1">Clinic performance overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Appointments" value={stats.todayAppointments || 0} icon={<CalendarCheck className="w-4 h-4" />} color="primary" />
          <StatCard label="Upcoming" value={stats.upcomingAppointments || 0} icon={<Clock className="w-4 h-4" />} color="blue" />
          <StatCard label="Total Patients" value={stats.totalPatients || 0} icon={<Users className="w-4 h-4" />} color="purple" />
          <StatCard label="Completed Today" value={stats.completedToday || 0} icon={<FileText className="w-4 h-4" />} color="amber" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">
              This report shows a summary of clinic activities. Detailed reporting features are coming soon.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </StaffPageLayout>
  );
}
