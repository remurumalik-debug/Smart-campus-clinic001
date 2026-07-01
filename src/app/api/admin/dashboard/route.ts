import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Appointment } from "@/models/Appointment";
import { User } from "@/models/User";
import { Admin } from "@/models/Admin";
import { Doctor } from "@/models/Doctor";
import { Department } from "@/models/Department";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["admin", "clinic_staff"].includes((session.user as any)?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isStaff = (session.user as any)?.role === "clinic_staff";
    await connectDB();

    if (isStaff) {
      const today = new Date().toLocaleDateString("en-CA");

      const todayAppointments = await Appointment.find({ appointmentDate: today }).sort({ appointmentTime: 1 });
      const totalPatients = await User.countDocuments({ role: "student" });
      const completedToday = await Appointment.countDocuments({ appointmentDate: today, status: "completed" });
      const upcomingAppointments = await Appointment.countDocuments({
        appointmentDate: { $gte: today },
        status: { $in: ["pending", "approved"] },
      });
      const consultations = await Appointment.find({ appointmentDate: today, status: "approved" }).sort({ appointmentTime: 1 });

      return NextResponse.json({
        stats: { todayAppointments: todayAppointments.length, totalPatients, completedToday, upcomingAppointments },
        todayAppointments,
        consultations,
      });
    }

    const totalStudents = await User.countDocuments({ role: "student" });
    const totalStaff = await Admin.countDocuments({ role: "clinic_staff" });
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalDepartments = await Department.countDocuments({ isActive: true });
    const pendingAppointments = await Appointment.countDocuments({ status: "pending" });
    const approvedAppointments = await Appointment.countDocuments({ status: "approved" });
    const completedAppointments = await Appointment.countDocuments({ status: "completed" });
    const rejectedAppointments = await Appointment.countDocuments({ status: "rejected" });

    const today = new Date().toLocaleDateString("en-CA");
    const todayAppointments = await Appointment.countDocuments({ appointmentDate: today });
    const todayAppointmentList = await Appointment.find({ appointmentDate: today }).sort({ appointmentTime: 1 });

    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentStudents = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password")
      .lean();
    const recentStaff = await Admin.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password")
      .lean();
    const recentUsers = [
      ...recentStudents.map((u) => ({ ...u, name: u.name, userType: "student" })),
      ...recentStaff.map((u) => ({ ...u, name: u.fullName, userType: u.role === "admin" ? "admin" : "clinic_staff" })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-CA");
      const count = await Appointment.countDocuments({ appointmentDate: dateStr });
      last7Days.push({ date: dateStr, count });
    }

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
      chartData: last7Days,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
