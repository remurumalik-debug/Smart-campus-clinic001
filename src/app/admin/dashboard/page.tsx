"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Building2,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
  Clock,
  UserPlus,
  Bell,
  GraduationCap,
  Shield,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import { CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface DashboardData {
  stats: {
    totalStudents: number;
    totalStaff: number;
    totalDoctors: number;
    totalAppointments: number;
    totalDepartments: number;
    todayAppointments: number;
    pendingAppointments: number;
    approvedAppointments: number;
    completedAppointments: number;
    rejectedAppointments: number;
  };
  todayAppointments: any[];
  recentAppointments: any[];
  recentUsers: any[];
  chartData: { date: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-muted">{error}</p>
          <Button onClick={fetchData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentAppointments, recentUsers, chartData } = data;
  const maxChartValue = Math.max(...chartData.map((d) => d.count), 1);

  const statCards = [
    { label: "Total Students", value: stats.totalStudents, icon: <Users className="w-4 h-4" />, color: "primary" as const },
    { label: "Clinic Staff", value: stats.totalStaff, icon: <Users className="w-4 h-4" />, color: "blue" as const },
    { label: "Total Doctors", value: stats.totalDoctors, icon: <Stethoscope className="w-4 h-4" />, color: "purple" as const },
    { label: "Total Appointments", value: stats.totalAppointments, icon: <CalendarCheck className="w-4 h-4" />, color: "primary" as const },
    { label: "Pending", value: stats.pendingAppointments, icon: <Clock className="w-4 h-4" />, color: "amber" as const },
    { label: "Total Departments", value: stats.totalDepartments, icon: <Building2 className="w-4 h-4" />, color: "blue" as const },
  ];

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-dark">Overview</h1>
        <p className="text-sm text-muted mt-1">Welcome to the Campus Clinic administration panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Appointment Analytics (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40 min-w-[300px]">
              {chartData.map((item) => (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-muted">{item.count}</span>
                  <div
                    className="w-full bg-primary/20 rounded-t-md relative overflow-hidden"
                    style={{ height: `${(item.count / maxChartValue) * 100}%` }}
                  >
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-t-md transition-all duration-500"
                      style={{ height: `${(item.count / maxChartValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted">{formatDate(item.date)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/appointments">
              <Button variant="outline" className="w-full justify-start">
                <CalendarCheck className="w-4 h-4" /> Manage Appointments
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4" /> Manage Users
              </Button>
            </Link>
            <Link href="/admin/doctors">
              <Button variant="outline" className="w-full justify-start">
                <Stethoscope className="w-4 h-4" /> Manage Doctors
              </Button>
            </Link>
            <Link href="/admin/departments">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="w-4 h-4" /> Manage Departments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {data.todayAppointments?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
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
                        <p className="text-xs text-muted">{apt.userEmail}</p>
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
            <p className="text-sm text-muted text-center py-8">No appointments today</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">No recent appointments</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-muted font-medium">Patient</th>
                      <th className="text-left py-3 px-2 text-muted font-medium">Doctor</th>
                      <th className="text-left py-3 px-2 text-muted font-medium">Date</th>
                      <th className="text-left py-3 px-2 text-muted font-medium">Time</th>
                      <th className="text-left py-3 px-2 text-muted font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAppointments.map((apt: any) => (
                      <tr key={apt._id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-dark">{apt.userName}</p>
                            <p className="text-xs text-muted">{apt.userEmail}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted">{apt.doctorName}</td>
                        <td className="py-3 px-2 text-muted">{apt.appointmentDate}</td>
                        <td className="py-3 px-2 text-muted">{apt.appointmentTime}</td>
                        <td className="py-3 px-2">
                          <StatusBadge status={apt.status} />
                        </td>
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
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">No recent signups</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((u: any) => (
                  <div key={u._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      u.userType === "admin" ? "bg-amber-100" : u.userType === "clinic_staff" ? "bg-purple-100" : "bg-primary/10"
                    }`}>
                      {u.userType === "admin" ? (
                        <Shield className="w-4 h-4 text-amber-600" />
                      ) : u.userType === "clinic_staff" ? (
                        <Stethoscope className="w-4 h-4 text-purple-600" />
                      ) : (
                        <GraduationCap className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark truncate">{u.name}</p>
                      <p className="text-xs text-muted truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.userType === "admin" ? "bg-amber-50 text-amber-700" :
                      u.userType === "clinic_staff" ? "bg-purple-50 text-purple-700" :
                      "bg-blue-50 text-blue-700"
                    }`}>
                      {u.userType === "admin" ? "Admin" : u.userType === "clinic_staff" ? "Staff" : "Student"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
