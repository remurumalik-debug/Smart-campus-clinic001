import { NextRequest, NextResponse } from "next/server";
import { connectDB, getLastConnectError } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Appointment } from "@/models/Appointment";
import { User } from "@/models/User";
import { Admin } from "@/models/Admin";
import { Doctor } from "@/models/Doctor";
import { Department } from "@/models/Department";

const fallbackStats = {
  totalStudents: 0,
  totalStaff: 0,
  totalDoctors: 0,
  totalAppointments: 0,
  totalDepartments: 0,
  pendingAppointments: 0,
  approvedAppointments: 0,
  completedAppointments: 0,
  rejectedAppointments: 0,
  todayAppointments: 0,
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "clinic_staff"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isStaff = (session.user as any)?.role === "clinic_staff";

    const dbOk = await connectDB();
    if (!dbOk) {
      return NextResponse.json({
        stats: fallbackStats,
        todayAppointments: [],
        recentAppointments: [],
        recentUsers: [],
        chartData: [],
        warning: "Database connection unavailable. " + (getLastConnectError() || "IP not whitelisted in MongoDB Atlas?"),
      });
    }

    if (isStaff) {
      const today = new Date().toLocaleDateString("en-CA");

      const [todayAppointments, totalPatients, completedToday, upcomingAppointments, consultations] = await Promise.all([
        Appointment.find({ appointmentDate: today }).sort({ appointmentTime: 1 }).limit(50).lean(),
        Appointment.distinct("userId").then((ids) => ids.length),
        Appointment.countDocuments({ appointmentDate: today, status: "completed" }),
        Appointment.countDocuments({ appointmentDate: { $gte: today }, status: { $in: ["pending", "approved"] } }),
        Appointment.find({ appointmentDate: today, status: "approved" }).sort({ appointmentTime: 1 }).limit(50).lean(),
      ]);

      return NextResponse.json({
        stats: { todayAppointments: todayAppointments.length, totalPatients, completedToday, upcomingAppointments },
        todayAppointments,
        consultations,
      });
    }

    const today = new Date().toLocaleDateString("en-CA");

    try {
      const [
        totalStudents, totalStaff, totalDoctors, totalAppointments, totalDepartments,
        pendingAppointments, approvedAppointments, completedAppointments, rejectedAppointments,
        todayAppointments, todayAppointmentList, recentAppointments, recentStudents, recentStaff,
        chartData,
      ] = await Promise.all([
        User.countDocuments({ role: "student" }),
        Admin.countDocuments({ role: "clinic_staff" }),
        Doctor.countDocuments(),
        Appointment.countDocuments(),
        Department.countDocuments({ isActive: true }),
        Appointment.countDocuments({ status: "pending" }),
        Appointment.countDocuments({ status: "approved" }),
        Appointment.countDocuments({ status: "completed" }),
        Appointment.countDocuments({ status: "rejected" }),
        Appointment.countDocuments({ appointmentDate: today }),
        Appointment.find({ appointmentDate: today }).sort({ appointmentTime: 1 }).limit(50).lean(),
        Appointment.find().sort({ createdAt: -1 }).limit(5).lean(),
        User.find().sort({ createdAt: -1 }).limit(5).select("-password").lean(),
        Admin.find().sort({ createdAt: -1 }).limit(5).select("-password").lean(),
        (async () => {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
          const startDate = sevenDaysAgo.toLocaleDateString("en-CA");
          const results = await Appointment.aggregate([
            { $match: { appointmentDate: { $gte: startDate } } },
            { $group: { _id: "$appointmentDate", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]);
          const map = new Map(results.map((r: { _id: string; count: number }) => [r._id, r.count]));
          const days: { date: string; count: number }[] = [];
          for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const dateStr = d.toLocaleDateString("en-CA");
            days.push({ date: dateStr, count: map.get(dateStr) || 0 });
          }
          return days;
        })(),
      ]);

      const recentUsers = [
        ...recentStudents.map((u) => ({ ...u, name: u.name, userType: "student" })),
        ...recentStaff.map((u) => ({ ...u, name: u.fullName, userType: u.role === "admin" ? "admin" : "clinic_staff" })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

      return NextResponse.json({
        stats: {
          totalStudents,
          totalStaff,
          totalDoctors,
          totalAppointments,
          totalDepartments,
          pendingAppointments,
          approvedAppointments,
          completedAppointments,
          rejectedAppointments,
          todayAppointments,
        },
        todayAppointments: todayAppointmentList,
        recentAppointments,
        recentUsers,
        chartData,
      });
    } catch (err) {
      console.error("Dashboard query failed, returning fallback data", err);
      return NextResponse.json({
        stats: fallbackStats,
        todayAppointments: [],
        recentAppointments: [],
        recentUsers: [],
        chartData: [],
        warning: "Dashboard data could not be loaded right now. The system is showing safe fallback values.",
      });
    }
  } catch (err) {
    console.error("Dashboard outer error", err);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
