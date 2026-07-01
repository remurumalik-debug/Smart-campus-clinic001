import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import StaffSidebar from "./StaffSidebar";
import SignOutButton from "@/components/SignOutButton";

export default async function StaffDashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session) redirect("/admin/login");
  if (role !== "clinic_staff") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StaffSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
          <h2 className="text-lg font-semibold text-dark">Clinic Staff Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">{(session.user as any)?.name?.charAt(0)?.toUpperCase() || "S"}</span>
              </div>
              <span className="text-sm font-medium text-dark hidden sm:block">{(session.user as any)?.name}</span>
            </div>
            <SignOutButton className="text-sm text-muted hover:text-dark bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer" />
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
