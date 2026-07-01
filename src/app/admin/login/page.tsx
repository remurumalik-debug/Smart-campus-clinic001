"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, Mail, Lock, KeyRound, LogIn } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityKey, setShowSecurityKey] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    securityKey: "",
  });

  const validate = () => {
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email format";
    if (!form.password) return "Password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (!form.securityKey) return "Security key is required";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("admin-login", {
        email: form.email,
        password: form.password,
        securityKey: form.securityKey,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid email, password, or security key" : result.error);
        setLoading(false);
        return;
      }

      const session = await getSession();
      const role = (session?.user as any)?.role;

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "clinic_staff") {
        router.push("/clinic-staff/dashboard");
      } else {
        setError("Unable to determine your role");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-dark px-4 sm:px-6 py-8 sm:py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Administrator Portal</h1>
          <p className="text-gray-400 mt-1 text-sm">Campus Clinic Management System</p>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-card border border-border p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-dark">Sign In</h2>
              <p className="text-sm text-muted mt-1">Authorized personnel only</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="admin@campus.edu"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                icon={<Mail className="w-4 h-4" />}
              />

              <div className="relative">
                <Input
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-muted hover:text-dark transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="securityKey"
                  label="Security Key"
                  type={showSecurityKey ? "text" : "password"}
                  placeholder="Enter your security key"
                  value={form.securityKey}
                  onChange={(e) => updateField("securityKey", e.target.value)}
                  icon={<KeyRound className="w-4 h-4" />}
                />
                <button
                  type="button"
                  onClick={() => setShowSecurityKey(!showSecurityKey)}
                  className="absolute right-3 top-[38px] text-muted hover:text-dark transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showSecurityKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full mt-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted">
                Returning to main site?{" "}
                <a href="/" className="text-primary hover:underline font-medium">
                  Home
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
