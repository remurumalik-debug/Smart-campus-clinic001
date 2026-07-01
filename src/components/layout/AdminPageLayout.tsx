"use client";

import { ReactNode } from "react";
import AdminSidebar from "@/app/admin/dashboard/AdminSidebar";
import SignOutButton from "@/components/SignOutButton";

export default function AdminPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-dark">Admin Dashboard</h2>
          </div>
          <SignOutButton className="text-sm text-muted hover:text-dark bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[32px]" />
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
