import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { Department } from "@/models/Department";
import { Doctor } from "@/models/Doctor";
import bcrypt from "bcryptjs";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    await connectDB();

    const results: string[] = [];

    const upsertAdmin = async (
      email: string,
      fullName: string,
      password: string,
      role: "admin" | "clinic_staff",
      securityKey: string
    ) => {
      const existing = await Admin.findOne({ email });
      if (!existing) {
        await Admin.create({
          fullName,
          email,
          password: await bcrypt.hash(password, 12),
          role,
          securityKey: await bcrypt.hash(securityKey, 12),
          isActive: true,
        });
        results.push(`${role} account created: ${email}`);
      } else {
        await Admin.findByIdAndUpdate(existing._id, {
          fullName,
          password: await bcrypt.hash(password, 12),
          role,
          securityKey: await bcrypt.hash(securityKey, 12),
          isActive: true,
        });
        results.push(`${role} account updated: ${email}`);
      }
    };

    await upsertAdmin(
      "admincampus@campus.edu.ng",
      "Campus Admin",
      "admin@123/",
      "admin",
      "ADMIN@#123"
    );

    await upsertAdmin(
      "clinicstaff@campus.edu.ng",
      "Clinic Staff",
      "clinicstaff@123/",
      "clinic_staff",
      "CLINICSTAFF@#123"
    );

    // Seed Departments if empty
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      const departments = [
        "General Medicine", "Pediatrics", "Gynecology", "Cardiology",
        "Dermatology", "Orthopedics", "Ophthalmology", "ENT",
        "Dentistry", "Physiotherapy", "Psychiatry", "Nutrition",
      ];
      for (const name of departments) {
        await Department.create({ name, description: `${name} department`, isActive: true });
      }
      results.push(`${departments.length} departments created`);
    } else {
      results.push(`${deptCount} departments exist`);
    }

    // Seed Doctors if empty
    const docCount = await Doctor.countDocuments();
    if (docCount === 0) {
      const depts = await Department.find({ isActive: true });
      if (depts.length > 0) {
        const doctors = [
          { name: "Dr. John Smith", email: "john.smith@campus.edu", specialization: "General Physician" },
          { name: "Dr. Sarah Johnson", email: "sarah.j@campus.edu", specialization: "Pediatrician" },
          { name: "Dr. Michael Brown", email: "michael.b@campus.edu", specialization: "Cardiologist" },
          { name: "Dr. Emily Davis", email: "emily.d@campus.edu", specialization: "Dermatologist" },
          { name: "Dr. James Wilson", email: "james.w@campus.edu", specialization: "Orthopedic Surgeon" },
          { name: "Dr. Lisa Anderson", email: "lisa.a@campus.edu", specialization: "Gynecologist" },
        ];
        for (let i = 0; i < doctors.length; i++) {
          const dept = depts[i % depts.length];
          await Doctor.create({
            ...doctors[i],
            departmentId: dept._id.toString(),
            departmentName: dept.name,
            isAvailable: true,
            availability: [
              { day: "Monday", startTime: "08:00", endTime: "17:00" },
              { day: "Tuesday", startTime: "08:00", endTime: "17:00" },
              { day: "Wednesday", startTime: "08:00", endTime: "17:00" },
              { day: "Thursday", startTime: "08:00", endTime: "17:00" },
              { day: "Friday", startTime: "08:00", endTime: "14:00" },
            ],
          });
        }
        results.push(`${doctors.length} doctors created`);
      }
    } else {
      results.push(`${docCount} doctors exist`);
    }

    return NextResponse.json({ success: true, message: results.join(" | ") });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
