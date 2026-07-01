"use client";

import { motion } from "framer-motion";
import { Settings, Shield, Bell, Palette } from "lucide-react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function AdminSettingsPage() {
  return (
    <AdminPageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">System Settings</h1>
          <p className="text-sm text-muted mt-1">Configure system preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-4 h-4" /> Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark">Two-factor authentication</span>
                <span className="text-xs bg-gray-100 text-muted px-2 py-1 rounded-md">Coming soon</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark">Session timeout (minutes)</span>
                <span className="text-sm font-medium text-dark">30</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark">Email notifications</span>
                <span className="text-xs bg-gray-100 text-muted px-2 py-1 rounded-md">Coming soon</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark">SMS reminders</span>
                <span className="text-xs bg-gray-100 text-muted px-2 py-1 rounded-md">Coming soon</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="w-4 h-4" /> Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark">Theme</span>
                <span className="text-sm font-medium text-dark">Light</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </AdminPageLayout>
  );
}
