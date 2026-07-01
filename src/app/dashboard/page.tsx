"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, MessageSquare, Clock, ArrowRight, CalendarCheck, User, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import StudentPageLayout from "@/components/layout/StudentPageLayout";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);

  const fetchAppointments = () => {
    if (session?.user) {
      fetch(`/api/appointments?userId=${(session.user as any).id}`)
        .then((r) => r.json())
        .then(setAppointments)
        .catch(() => {});
    }
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 15000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  const user = session.user as any;
  const today = new Date().toLocaleDateString("en-CA");
  const todayAppts = appointments.filter((a: any) => a.appointmentDate === today);
  const pending = appointments.filter((a: any) => a.status === "pending").length;
  const upcoming = appointments.filter((a: any) =>
    ["pending", "approved"].includes(a.status)
  ).length;
  const completed = appointments.filter((a: any) => a.status === "completed").length;
  const recent = appointments.slice(0, 5);

  return (
    <StudentPageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-dark">Welcome, {user.name}</h1>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
          <Link href="/booking">
            <Button className="w-full sm:w-auto"><CalendarDays className="w-4 h-4" /> Book Appointment</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today's Appointments" value={todayAppts.length} icon={<CalendarCheck className="w-4 h-4" />} color="primary" />
          <StatCard label="Upcoming" value={upcoming} icon={<Clock className="w-4 h-4" />} color="blue" />
          <StatCard label="Pending" value={pending} icon={<AlertCircle className="w-4 h-4" />} color="amber" />
          <StatCard label="Completed" value={completed} icon={<CheckCircle className="w-4 h-4" />} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppts.length === 0 ? (
                <p className="text-sm text-muted text-center py-6">No appointments scheduled for today</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-muted font-medium">Doctor</th>
                        <th className="text-left py-3 px-2 text-muted font-medium">Department</th>
                        <th className="text-left py-3 px-2 text-muted font-medium">Time</th>
                        <th className="text-left py-3 px-2 text-muted font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAppts.map((apt: any) => (
                        <tr key={apt._id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                          <td className="py-3 px-2 font-medium text-dark">{apt.doctorName}</td>
                          <td className="py-3 px-2 text-muted">{apt.departmentName}</td>
                          <td className="py-3 px-2 text-muted">{apt.appointmentTime}</td>
                          <td className="py-3 px-2"><StatusBadge status={apt.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/booking"><Button variant="outline" className="w-full justify-start"><CalendarDays className="w-4 h-4" /> Book Appointment</Button></Link>
              <Link href="/appointments"><Button variant="outline" className="w-full justify-start"><CalendarCheck className="w-4 h-4" /> My Appointments</Button></Link>
              <Link href="/chat"><Button variant="outline" className="w-full justify-start"><MessageSquare className="w-4 h-4" /> AI Chat</Button></Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Appointments</CardTitle>
            <Link href="/appointments" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-10 h-10 text-muted/40 mx-auto mb-3" />
                <p className="text-sm text-muted">No appointments yet</p>
                <Link href="/booking">
                  <Button variant="outline" size="sm" className="mt-3">Book your first appointment</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted font-medium">Doctor</th>
                      <th className="text-left py-3 px-2 text-muted font-medium">Department</th>
                      <th className="text-left py-3 px-2 text-muted font-medium">Date</th>
                      <th className="text-left py-3 px-2 text-muted font-medium">Time</th>
                      <th className="text-left py-3 px-2 text-muted font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((apt: any) => (
                      <tr key={apt._id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-2 font-medium text-dark">{apt.doctorName}</td>
                        <td className="py-3 px-2 text-muted">{apt.departmentName}</td>
                        <td className="py-3 px-2 text-muted">{apt.appointmentDate}</td>
                        <td className="py-3 px-2 text-muted">{apt.appointmentTime}</td>
                        <td className="py-3 px-2"><StatusBadge status={apt.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </StudentPageLayout>
  );
}
