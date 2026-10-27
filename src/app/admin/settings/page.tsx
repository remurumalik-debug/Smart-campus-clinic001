"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Building2, Clock, Mail, Settings2, Save, AlertCircle, CheckCircle, Loader2,
} from "lucide-react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface SettingsForm {
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  appointmentDuration: number;
  maxAppointmentsPerDay: number;
  systemEmail: string;
  emailNotifications: boolean;
  smsReminders: boolean;
}

const defaultForm: SettingsForm = {
  clinicName: "Campus Clinic",
  clinicAddress: "",
  clinicPhone: "",
  clinicEmail: "",
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  openingTime: "08:00",
  closingTime: "17:00",
  appointmentDuration: 30,
  maxAppointmentsPerDay: 50,
  systemEmail: "",
  emailNotifications: true,
  smsReminders: false,
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          setForm({
            clinicName: s.clinicName || defaultForm.clinicName,
            clinicAddress: s.clinicAddress || "",
            clinicPhone: s.clinicPhone || "",
            clinicEmail: s.clinicEmail || "",
            workingDays: s.workingDays?.length ? s.workingDays : defaultForm.workingDays,
            openingTime: s.openingTime || defaultForm.openingTime,
            closingTime: s.closingTime || defaultForm.closingTime,
            appointmentDuration: s.appointmentDuration || defaultForm.appointmentDuration,
            maxAppointmentsPerDay: s.maxAppointmentsPerDay || defaultForm.maxAppointmentsPerDay,
            systemEmail: s.systemEmail || "",
            emailNotifications: s.notificationPreferences?.emailNotifications ?? true,
            smsReminders: s.notificationPreferences?.smsReminders ?? false,
          });
        }
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
    setDirty(true);
  };

  const updateField = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.workingDays.length === 0) {
      setError("At least one working day is required");
      return;
    }
    if (form.openingTime >= form.closingTime) {
      setError("Opening time must be before closing time");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicName: form.clinicName,
          clinicAddress: form.clinicAddress,
          clinicPhone: form.clinicPhone,
          clinicEmail: form.clinicEmail,
          workingDays: form.workingDays,
          openingTime: form.openingTime,
          closingTime: form.closingTime,
          appointmentDuration: form.appointmentDuration,
          maxAppointmentsPerDay: form.maxAppointmentsPerDay,
          systemEmail: form.systemEmail,
          notificationPreferences: {
            emailNotifications: form.emailNotifications,
            smsReminders: form.smsReminders,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save settings");
        return;
      }

      setSuccess("Settings saved successfully");
      setDirty(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPageLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark">System Settings</h1>
            <p className="text-sm text-muted mt-1">Configure clinic preferences and system configuration</p>
          </div>
          <Button onClick={handleSubmit} loading={saving} disabled={!dirty}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Clinic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-dark/80">Clinic Name</label>
                  <input
                    type="text"
                    value={form.clinicName}
                    onChange={(e) => updateField("clinicName", e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-dark/80">Address</label>
                  <input
                    type="text"
                    value={form.clinicAddress}
                    onChange={(e) => updateField("clinicAddress", e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-dark/80">Phone</label>
                  <input
                    type="text"
                    value={form.clinicPhone}
                    onChange={(e) => updateField("clinicPhone", e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-dark/80">Clinic Email</label>
                  <input
                    type="email"
                    value={form.clinicEmail}
                    onChange={(e) => updateField("clinicEmail", e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="w-4 h-4" /> Operating Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark/80 mb-2">Working Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors cursor-pointer ${
                          form.workingDays.includes(day)
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-muted border-border hover:border-primary/30"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-dark/80">Opening Time</label>
                    <input
                      type="time"
                      value={form.openingTime}
                      onChange={(e) => updateField("openingTime", e.target.value)}
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-dark/80">Closing Time</label>
                    <input
                      type="time"
                      value={form.closingTime}
                      onChange={(e) => updateField("closingTime", e.target.value)}
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-dark/80">Appointment Duration (min)</label>
                    <input
                      type="number"
                      min={15}
                      max={120}
                      step={5}
                      value={form.appointmentDuration}
                      onChange={(e) => updateField("appointmentDuration", parseInt(e.target.value) || 30)}
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-dark/80">Max Appointments / Day</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={form.maxAppointmentsPerDay}
                      onChange={(e) => updateField("maxAppointmentsPerDay", parseInt(e.target.value) || 50)}
                      className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="w-4 h-4" /> System Email</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-dark/80">System Email Address</label>
                  <input
                    type="email"
                    value={form.systemEmail}
                    onChange={(e) => updateField("systemEmail", e.target.value)}
                    placeholder="system@campus.edu"
                    className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <p className="text-xs text-muted">Used for system-generated emails and notifications</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings2 className="w-4 h-4" /> Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-dark">Email Notifications</span>
                    <p className="text-xs text-muted">Send email notifications for appointments and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.emailNotifications}
                      onChange={(e) => updateField("emailNotifications", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-dark">SMS Reminders</span>
                    <p className="text-xs text-muted">Send SMS reminders for upcoming appointments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.smsReminders}
                      onChange={(e) => updateField("smsReminders", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </motion.div>
    </AdminPageLayout>
  );
}
