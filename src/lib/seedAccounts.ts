import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { Admin } from "@/models/Admin";

export const DEFAULT_ADMIN_ACCOUNTS = [
  {
    email: "admincampus@campus.edu.ng",
    fullName: "Campus Admin",
    password: "admin@123/",
    role: "admin" as const,
    securityKey: "ADMIN@#123",
  },
  {
    email: "clinicstaff@campus.edu.ng",
    fullName: "Clinic Staff",
    password: "clinicstaff@123/",
    role: "clinic_staff" as const,
    securityKey: "CLINICSTAFF@#123",
  },
];

export function findFallbackAdminAccount(email: string) {
  return DEFAULT_ADMIN_ACCOUNTS.find((account) => account.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function ensureSeededAdminAccounts() {
  const results: string[] = [];

  try {
    await connectDB();
  } catch (error) {
    results.push(`Database unavailable while seeding admin accounts: ${error instanceof Error ? error.message : "Unknown error"}`);
    return results;
  }

  for (const account of DEFAULT_ADMIN_ACCOUNTS) {
    const existing = await Admin.findOne({ email: account.email });

    if (!existing) {
      await Admin.create({
        fullName: account.fullName,
        email: account.email,
        password: await bcrypt.hash(account.password, 12),
        role: account.role,
        securityKey: await bcrypt.hash(account.securityKey, 12),
        isActive: true,
      });
      results.push(`Seeded ${account.role} account: ${account.email}`);
      continue;
    }

    await Admin.findByIdAndUpdate(existing._id, {
      fullName: account.fullName,
      password: await bcrypt.hash(account.password, 12),
      role: account.role,
      securityKey: await bcrypt.hash(account.securityKey, 12),
      isActive: true,
    });
    results.push(`Updated ${account.role} account: ${account.email}`);
  }

  return results;
}
