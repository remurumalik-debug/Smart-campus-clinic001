"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("student-login", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-dark px-4 sm:px-6 py-8 sm:py-12 text-center">
        <button type="button" onClick={() => router.push("/")} className="inline-flex items-center gap-2 mb-4 mx-auto cursor-pointer bg-transparent border-none">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">CC</span>
          </div>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Welcome Back</h1>
        <p className="text-gray-400 mt-1 text-sm">Sign in to your student account</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-card border border-border p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="you@campus.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                icon={<Mail className="w-4 h-4" />}
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                icon={<Lock className="w-4 h-4" />}
              />

              <div className="text-right -mt-1">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="inline-block text-sm sm:text-xs text-primary hover:underline font-medium py-2 sm:py-0 cursor-pointer bg-transparent border-none"
                >
                  Forgot Password?
                </button>
              </div>

              <Button type="submit" size="lg" loading={loading} className="w-full">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-muted">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="text-primary hover:underline font-medium cursor-pointer bg-transparent border-none p-0"
                >
                  Register
                </button>
              </p>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
