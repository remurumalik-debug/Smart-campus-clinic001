"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import StudentSidebar from "./StudentSidebar";
import SignOutButton from "@/components/SignOutButton";

export default function StudentPageLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) return null;

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StudentSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-dark">Student Dashboard</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "S"}
                </span>
              </div>
              <span className="text-sm font-medium text-dark hidden sm:block">
                {user?.name}
              </span>
            </div>
            <SignOutButton className="text-sm text-muted hover:text-dark bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[32px]" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
