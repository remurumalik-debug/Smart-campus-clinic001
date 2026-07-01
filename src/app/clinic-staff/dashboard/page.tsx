"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Clock, Users, ClipboardList, TrendingUp, AlertTriangle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";

export default function StaffDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDashboard = () => {
    fetch("/api/admin/dashboard?staff=true")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );

  const stats = data?.stats || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Staff Dashboard</h1>
        <p className="text-sm text-muted mt-1">Manage clinic operations and patient care</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Appointments" value={stats.todayAppointments || 0} icon={<CalendarCheck className="w-4 h-4" />} color="primary" />
        <StatCard label="Upcoming" value={stats.upcomingAppointments || 0} icon={<Clock className="w-4 h-4" />} color="blue" />
        <StatCard label="Total Patients" value={stats.totalPatients || 0} icon={<Users className="w-4 h-4" />} color="purple" />
        <StatCard label="Completed Today" value={stats.completedToday || 0} icon={<ClipboardList className="w-4 h-4" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.todayAppointments?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted font-medium">Patient</th>
                      <th className="text-left py-3 px-2 text-muted font-medium">Doctor</th>
                      <th className="text-left py-3 px-2 text-muted font-medium">Time</th>
                      <th className="text-left py-3 px-2 text-muted font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.todayAppointments.map((apt: any) => (
                      <tr key={apt._id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-2">
                          <p className="font-medium text-dark">{apt.userName}</p>
                        </td>
                        <td className="py-3 px-2 text-muted">{apt.doctorName}</td>
                        <td className="py-3 px-2 text-muted">{apt.appointmentTime}</td>
                        <td className="py-3 px-2">
                          <StatusBadge status={apt.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-6">No appointments today</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/clinic-staff/appointments")}><CalendarCheck className="w-4 h-4" /> Manage Appointments</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/clinic-staff/patients")}><Users className="w-4 h-4" /> View Patients</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/clinic-staff/consultations")}><ClipboardList className="w-4 h-4" /> Update Records</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/clinic-staff/reports")}><FileText className="w-4 h-4" /> View Reports</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.consultations?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-muted font-medium">Patient</th>
                    <th className="text-left py-3 px-2 text-muted font-medium">Doctor</th>
                    <th className="text-left py-3 px-2 text-muted font-medium">Department</th>
                    <th className="text-left py-3 px-2 text-muted font-medium">Time</th>
                    <th className="text-left py-3 px-2 text-muted font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.consultations.map((apt: any) => (
                    <tr key={apt._id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                      <td className="py-3 px-2">
                        <p className="font-medium text-dark">{apt.userName}</p>
                        {apt.symptoms && <p className="text-xs text-muted">"{apt.symptoms}"</p>}
                      </td>
                      <td className="py-3 px-2 text-muted">{apt.doctorName}</td>
                      <td className="py-3 px-2 text-muted">{apt.departmentName}</td>
                      <td className="py-3 px-2 text-muted">{apt.appointmentTime}</td>
                      <td className="py-3 px-2">
                        <StatusBadge status={apt.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-6">No active consultations today</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
