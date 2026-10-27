"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LogOut, CalendarDays, MessageSquare, LayoutDashboard, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = session?.user as { name?: string; email?: string; role?: string } | undefined;
  const isStudent = user?.role === "student";
  const isStaff = user?.role === "clinic_staff";
  const isAdmin = user?.role === "admin";

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-semibold text-dark text-lg hidden sm:block">
              CampusClinic
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {!session ? (
              <>
                <Link href="/" className="px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent transition-colors">
                  Home
                </Link>
                <Link href="/login" className="px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent transition-colors">
                  Student Login
                </Link>
                <Link href="/register">
                  <Button size="sm" className="ml-2">Get Started</Button>
                </Link>
              </>
            ) : (
              <>
                {isStudent && (
                  <>
                    <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent transition-colors">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link href="/booking" className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent transition-colors">
                      <CalendarDays className="w-4 h-4" />
                      Booking
                    </Link>
                    <Link href="/appointments" className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent transition-colors">
                      <CalendarDays className="w-4 h-4" />
                      Appointments
                    </Link>
                    <Link href="/chat" className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      AI Chat
                    </Link>
                  </>
                )}
                {(isAdmin || isStaff) && (
                  <Link
                    href={isAdmin ? "/admin/dashboard" : "/clinic-staff/dashboard"}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-primary font-medium hover:bg-primary-light rounded-lg transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    {isAdmin ? "Admin Dashboard" : "Staff Dashboard"}
                  </Link>
                )}
                <div className="flex items-center gap-1 ml-4 pl-4 border-l border-border">
                  <NotificationBell />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-dark font-medium hidden lg:block">{user?.name}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="p-2 text-muted hover:text-dark rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {!session ? (
              <>
                <Link href="/" className="block px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent" onClick={() => setMobileOpen(false)}>Home</Link>
                <Link href="/login" className="block px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent" onClick={() => setMobileOpen(false)}>Student Login</Link>
                <Link href="/register" className="block px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 px-3 py-3 border-b border-border mb-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark">{user?.name}</p>
                    <p className="text-xs text-muted">{user?.email}</p>
                  </div>
                </div>
                {isStudent && (
                  <>
                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent" onClick={() => setMobileOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/booking" className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent" onClick={() => setMobileOpen(false)}>
                      <CalendarDays className="w-4 h-4" /> Book Appointment
                    </Link>
                    <Link href="/appointments" className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent" onClick={() => setMobileOpen(false)}>
                      <CalendarDays className="w-4 h-4" /> My Appointments
                    </Link>
                    <Link href="/chat" className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-dark rounded-lg hover:bg-accent" onClick={() => setMobileOpen(false)}>
                      <MessageSquare className="w-4 h-4" /> AI Chat
                    </Link>
                  </>
                )}
                {(isAdmin || isStaff) && (
                  <Link
                    href={isAdmin ? "/admin/dashboard" : "/clinic-staff/dashboard"}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-primary font-medium rounded-lg hover:bg-primary-light"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Shield className="w-4 h-4" /> {isAdmin ? "Admin Dashboard" : "Staff Dashboard"}
                  </Link>
                )}
                <button
                  onClick={() => { signOut({ callbackUrl: "/login" }); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
