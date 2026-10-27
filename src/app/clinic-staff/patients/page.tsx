"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Mail, BookOpen } from "lucide-react";
import StaffPageLayout from "@/components/layout/StaffPageLayout";

export default function StaffPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPatients = async () => {
    setLoading(true);
    try {
      let url = "/api/admin/users?type=student&limit=100";
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.users || []);
      }
    } catch (e) {
      console.error("Failed to fetch patients", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <StaffPageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Patients</h1>
          <p className="text-sm text-muted mt-1">View registered patients</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") fetchPatients(); }}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button onClick={fetchPatients} className="px-4 py-2 min-h-[40px] bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark cursor-pointer">Search</button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted">Loading...</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-muted/40 mx-auto mb-3" />
            <p className="text-sm text-muted">No patients found</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {patients.map((user: any) => (
              <div key={user._id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">{user.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium text-dark">{user.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                      {user.matricNo && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {user.matricNo}</span>}
                    </div>
                  </div>
                </div>
                {user.department && (
                  <span className="text-xs text-muted bg-gray-100 px-2 py-1 rounded-md">{user.department}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </StaffPageLayout>
  );
}
