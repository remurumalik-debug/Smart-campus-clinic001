"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Mail, BookOpen, Building2, Camera, Lock, Save, AlertCircle, CheckCircle } from "lucide-react";
import StudentPageLayout from "@/components/layout/StudentPageLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [image, setImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || "");
        setDepartment(data.department || "");
        setImage(data.image || "");
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be smaller than 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setImage(dataUrl);
      try {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl }),
        });
        if (res.ok) {
          setSuccess("Profile picture updated");
          updateSession();
          setTimeout(() => setSuccess(""), 3000);
        }
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    const updates: any = { name, department };

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match");
        setSaving(false);
        return;
      }
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters");
        setSaving(false);
        return;
      }
      if (!currentPassword) {
        setError("Enter your current password to set a new one");
        setSaving(false);
        return;
      }
      updates.currentPassword = currentPassword;
      updates.newPassword = newPassword;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update profile");
        setSaving(false);
        return;
      }

      setProfile(data);
      updateSession();
      setSuccess("Profile updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("An error occurred");
    }
    setSaving(false);
  };

  return (
    <StudentPageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">My Profile</h1>
          <p className="text-sm text-muted mt-1">Manage your personal information and security</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-4 border-gray-100">
                  {image ? (
                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-primary/40" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <p className="text-xs text-muted text-center">Click the camera icon to upload<br />Max 2MB</p>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  id="name"
                  label="Full Name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  icon={<Mail className="w-4 h-4" />}
                />
                <Input
                  id="matricNo"
                  label="Matric No."
                  value={profile?.matricNo || ""}
                  disabled
                  icon={<BookOpen className="w-4 h-4" />}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-dark/80">Department</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full h-10 rounded-lg border border-border bg-white pl-10 pr-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  id="currentPassword"
                  label="Current Password"
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                />
                <Input
                  id="newPassword"
                  label="New Password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                />
                <Input
                  id="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                />
                <p className="text-xs text-muted">Leave password fields empty to keep your current password</p>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} loading={saving}>
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </StudentPageLayout>
  );
}
