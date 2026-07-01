"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Check, X } from "lucide-react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import Button from "@/components/ui/Button";
import { toast } from "sonner";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments");
      if (res.ok) setDepartments(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("Department name is required");
      return;
    }
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        toast.success("Department added");
        setShowForm(false);
        setNewName("");
        fetchDepartments();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add department");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <AdminPageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark">Departments</h1>
            <p className="text-sm text-muted mt-1">Manage clinic departments</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Department</Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-dark">New Department</h3>
            <div className="flex gap-2">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Department name"
                className="flex-1 h-10 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={handleAdd} className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark cursor-pointer"><Check className="w-5 h-5" /></button>
              <button onClick={() => setShowForm(false)} className="p-2 bg-gray-100 text-muted rounded-lg hover:bg-gray-200 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-10 h-10 text-muted/40 mx-auto mb-3" />
            <p className="text-sm text-muted">No departments available</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {departments.map((dept: any) => (
              <div key={dept._id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-dark">{dept.name}</p>
                    {dept.description && <p className="text-xs text-muted mt-0.5">{dept.description}</p>}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${dept.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                  {dept.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AdminPageLayout>
  );
}
