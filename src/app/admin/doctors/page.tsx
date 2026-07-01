"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Stethoscope, Plus, Mail, Building2 } from "lucide-react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import Button from "@/components/ui/Button";
import { toast } from "sonner";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", specialization: "", departmentId: "" });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doctors");
      if (res.ok) setDoctors(await res.json());
    } catch {}
    setLoading(false);
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      if (res.ok) setDepartments(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.specialization || !form.departmentId) {
      toast.error("All fields are required");
      return;
    }
    try {
      const dept = departments.find((d) => d._id === form.departmentId);
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, departmentName: dept?.name || "" }),
      });
      if (res.ok) {
        toast.success("Doctor added successfully");
        setShowForm(false);
        setForm({ name: "", email: "", specialization: "", departmentId: "" });
        fetchDoctors();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add doctor");
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
            <h1 className="text-2xl font-bold text-dark">Doctors</h1>
            <p className="text-sm text-muted mt-1">Manage clinic doctors</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Doctor</Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-semibold text-dark">New Doctor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark/80 mb-1">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-10 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/80 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/80 mb-1">Specialization</label>
                <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  className="w-full h-10 rounded-lg border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark/80 mb-1">Department</label>
                <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select department</option>
                  {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd}>Save Doctor</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <Stethoscope className="w-10 h-10 text-muted/40 mx-auto mb-3" />
            <p className="text-sm text-muted">No doctors registered</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {doctors.map((doc: any) => (
              <div key={doc._id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-dark">{doc.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {doc.email}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {doc.departmentName}</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted bg-gray-100 px-2 py-1 rounded-md">{doc.specialization}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AdminPageLayout>
  );
}
