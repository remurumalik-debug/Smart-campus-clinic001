"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  MessageSquare,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SignOutButton from "@/components/SignOutButton";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/appointments", label: "Appointments", icon: CalendarCheck },
  { href: "/booking", label: "Book Appointment", icon: CalendarDays },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/profile", label: "My Profile", icon: User },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white border border-border rounded-lg p-2 shadow-card cursor-pointer"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5 text-dark" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "bg-dark text-white flex flex-col transition-all duration-300 fixed md:sticky top-0 left-0 h-screen z-50",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg flex-shrink-0" />
              <span className="font-semibold text-sm">Student Portal</span>
            </div>
          )}
          {collapsed && (
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg mx-auto flex-shrink-0" />
          )}
          <button
            onClick={() => { setMobileOpen(false); }}
            className="md:hidden p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-primary text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/10",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-full p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          {!collapsed && (
            <SignOutButton className="w-full text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors cursor-pointer mt-2" />
          )}
        </div>
      </aside>
    </>
  );
}
