"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AdminSidebar from "@/app/admin/dashboard/AdminSidebar";
import SignOutButton from "@/components/SignOutButton";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function AdminPageLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    redirect("/admin/login");
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/admin/login");
    return null;
  }

  const role = (session.user as any)?.role;
  if (role !== "admin" && role !== "clinic_staff") {
    redirect("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-dark">Admin Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <SignOutButton callbackUrl="/admin/login" className="text-sm text-muted hover:text-dark bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[32px]" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
