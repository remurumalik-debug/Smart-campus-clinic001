"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Mail, BookOpen, Trash2, KeyRound, Shield, Stethoscope, GraduationCap, Clock } from "lucide-react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const roleStyles: Record<string, { label: string; icon: any; class: string }> = {
  student: { label: "Student", icon: GraduationCap, class: "bg-blue-50 text-blue-700" },
  clinic_staff: { label: "Staff", icon: Stethoscope, class: "bg-purple-50 text-purple-700" },
  admin: { label: "Admin", icon: Shield, class: "bg-amber-50 text-amber-700" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [resetTarget, setResetTarget] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/users?limit=100&type=${typeFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [typeFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${deleteTarget._id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
        setDeleteTarget(null);
      }
    } catch {}
    setDeleting(false);
  };

  const handleResetPassword = async () => {
    if (!resetTarget || !newPassword) return;
    if (newPassword.length < 6) { setResetMsg("Password must be at least 6 characters"); return; }
    setResetting(true);
    setResetMsg("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resetTarget._id, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetMsg("");
        setResetTarget(null);
        setNewPassword("");
      } else {
        setResetMsg(data.error || "Failed to reset password");
      }
    } catch {
      setResetMsg("An error occurred");
    }
    setResetting(false);
  };

  return (
    <AdminPageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Users</h1>
          <p className="text-sm text-muted mt-1">Manage students, clinic staff, and administrators</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg">
            {["all", "student", "staff", "admin"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  typeFilter === t ? "bg-white text-dark shadow-sm" : "text-muted hover:text-dark"
                }`}
              >
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") fetchUsers(); }}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button onClick={fetchUsers} className="px-4 py-2 min-h-[40px] bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark cursor-pointer">Search</button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-muted/40 mx-auto mb-3" />
            <p className="text-sm text-muted">No users found</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {users.map((user: any) => (
              <div key={user._id} className="bg-white rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    user.userType === "admin" ? "bg-amber-100" : user.userType === "clinic_staff" ? "bg-purple-100" : "bg-primary/10"
                  }`}>
                    <span className={`font-semibold text-sm ${
                      user.userType === "admin" ? "text-amber-700" : user.userType === "clinic_staff" ? "text-purple-700" : "text-primary"
                    }`}>{user.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-dark truncate">{user.name}</p>
                      {(() => {
                        const ut = user.userType || "student";
                        const rs = roleStyles[ut] || roleStyles.student;
                        const Icon = rs.icon;
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${rs.class}`}>
                            <Icon className="w-3 h-3" />
                            {rs.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3 text-xs text-muted mt-0.5">
                      <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3 flex-shrink-0" /> {user.email}</span>
                      {user.matricNo && <span className="flex items-center gap-1 truncate"><BookOpen className="w-3 h-3 flex-shrink-0" /> {user.matricNo}</span>}
                      {user.lastLogin && (
                        <span className="flex items-center gap-1 truncate"><Clock className="w-3 h-3 flex-shrink-0" /> Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-0 sm:ml-4">
                  {user.department && (
                    <span className="text-xs text-muted bg-gray-100 px-2 py-1 rounded-md hidden sm:inline">{user.department}</span>
                  )}
                  <button
                    onClick={() => { setResetTarget(user); setNewPassword(""); setResetMsg(""); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                    title="Reset Password"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Reset Password</span>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(user)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                    title="Delete User"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User">
        <p className="text-sm text-muted mb-6">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong> ({deleteTarget?.email})? This action cannot be undone.
        </p>
        <div className="flex items-center gap-3 justify-end">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title="Reset Password">
        <p className="text-sm text-muted mb-4">
          Set a new password for <strong>{resetTarget?.name}</strong> ({resetTarget?.email}).
        </p>
        {resetMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {resetMsg}
          </div>
        )}
        <div className="space-y-4">
          <Input
            id="new-password"
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={<KeyRound className="w-4 h-4" />}
          />
          <div className="flex items-center gap-3 justify-end">
            <Button variant="outline" onClick={() => setResetTarget(null)}>Cancel</Button>
            <Button loading={resetting} onClick={handleResetPassword}>Update Password</Button>
          </div>
        </div>
      </Modal>
    </AdminPageLayout>
  );
}
