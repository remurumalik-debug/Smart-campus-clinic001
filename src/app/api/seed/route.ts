import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Admin } from "@/models/Admin";
import { Department } from "@/models/Department";
import { Doctor } from "@/models/Doctor";
import { ensureSeededAdminAccounts } from "@/lib/seedAccounts";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const connected = await connectDB();
  const results: string[] = [];

  if (!connected) {
    results.push("Database unavailable — fallback accounts are active");
    return NextResponse.json({ success: true, message: results.join(" | ") });
  }

  try {
    // Remove old staff email that was replaced
    await Admin.deleteOne({ email: "clinicstaff@edu.ng" }).catch(() => {});

    results.push(...(await ensureSeededAdminAccounts()));

    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      const departments = [
        { name: "General Medicine", description: "Handles everyday health concerns — common illnesses like colds, flu, fever, infections, minor injuries, and routine check-ups. It's the best first stop when you're not sure which department you need." },
        { name: "Pediatrics", description: "Provides medical care for infants, children, and adolescents, including growth and development checks, childhood illnesses, and routine vaccinations." },
        { name: "Obstetrics & Gynecology (OB/GYN)", description: "Focuses on women's reproductive health — menstrual problems, period pain, pregnancy care, and gynecological check-ups." },
        { name: "General Surgery", description: "Deals with conditions that may require surgical treatment, including minor procedures, wound care, and pre/post-surgical follow-up." },
        { name: "Orthopedics", description: "Treats bone, joint, and muscle problems — fractures, sprains, back and neck pain, sports injuries, and rehabilitation." },
        { name: "Cardiology", description: "Specializes in heart and blood vessel health — chest pain, palpitations, high blood pressure, and heart-related conditions." },
        { name: "Neurology", description: "Deals with the brain, spinal cord, and nervous system — headaches, migraines, dizziness, seizures, and nerve problems." },
        { name: "Dermatology", description: "Treats skin, hair, and nail conditions — rashes, acne, eczema, allergies, and skin infections." },
        { name: "Ophthalmology", description: "Specializes in eye care — vision problems, eye infections, red or irritated eyes, and routine eye examinations." },
        { name: "Ear, Nose & Throat (ENT)", description: "Treats conditions of the ear, nose, and throat — earaches, sinus issues, sore throats, tonsillitis, and hearing problems." },
        { name: "Psychiatry", description: "Provides mental health care — anxiety, depression, stress management, and confidential counseling." },
        { name: "Emergency Medicine", description: "Handles urgent and serious medical situations that need immediate attention during clinic hours." },
      ];
      for (const dept of departments) {
        await Department.create({ ...dept, isActive: true });
      }
      results.push(`${departments.length} departments created`);
    } else {
      results.push(`${deptCount} departments exist`);
    }

    const docCount = await Doctor.countDocuments();
    if (docCount === 0) {
      const depts = await Department.find({ isActive: true });
      if (depts.length > 0) {
        const doctors = [
          { name: "Dr. John Smith", email: "john.smith@campus.edu", specialization: "General Physician" },
          { name: "Dr. Sarah Johnson", email: "sarah.j@campus.edu", specialization: "Pediatrician" },
          { name: "Dr. Lisa Anderson", email: "lisa.a@campus.edu", specialization: "OB/GYN Specialist" },
          { name: "Dr. Robert Chen", email: "robert.chen@campus.edu", specialization: "General Surgeon" },
          { name: "Dr. James Wilson", email: "james.w@campus.edu", specialization: "Orthopedic Surgeon" },
          { name: "Dr. Michael Brown", email: "michael.b@campus.edu", specialization: "Cardiologist" },
          { name: "Dr. Sophia Martinez", email: "sophia.m@campus.edu", specialization: "Neurologist" },
          { name: "Dr. Emily Davis", email: "emily.d@campus.edu", specialization: "Dermatologist" },
          { name: "Dr. David Kim", email: "david.kim@campus.edu", specialization: "Ophthalmologist" },
          { name: "Dr. Emily Thompson", email: "emily.t@campus.edu", specialization: "ENT Specialist" },
          { name: "Dr. Mark Taylor", email: "mark.taylor@campus.edu", specialization: "Psychiatrist" },
          { name: "Dr. Laura Williams", email: "laura.w@campus.edu", specialization: "Emergency Medicine" },
        ];
        for (let i = 0; i < doctors.length; i++) {
          const dept = depts[i % depts.length];
          await Doctor.create({
            ...doctors[i],
            departmentId: dept._id.toString(),
            departmentName: dept.name,
            isActive: true,
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
