"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Mail, Lock, BookOpen, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const DEPARTMENTS = [
  "Computer Science", "Cyber Security", "Software Engineering",
  "Information Technology", "Computer Engineering", "Civil Engineering",
  "Chemical Engineering", "Electrical and Electronics Engineering",
  "Mechanical Engineering", "Mathematics", "Statistics", "Physics",
  "Chemistry", "Biochemistry", "Microbiology", "Biology",
  "Medicine and Surgery", "Nursing Science", "Medical Laboratory Science",
  "Public Health", "Law", "Accounting", "Business Administration", "Economics",
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    matricNo: "",
    department: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.matricNo || !form.department) {
      setError("All fields are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          matricNo: form.matricNo,
          department: form.department,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const signInResult = await signIn("student-login", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created. Please login.");
        router.push("/login");
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
          <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Create Account</h1>
        <p className="text-gray-400 mt-1 text-sm">Register for campus clinic services</p>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="name" label="Full Name" placeholder="John Doe"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                icon={<User className="w-4 h-4" />}
              />
              <Input
                id="email" label="Email Address" type="email" placeholder="you@campus.edu"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                icon={<Mail className="w-4 h-4" />}
              />
              <Input
                id="matricNo" label="Matric No." placeholder="CSC/2024/001"
                value={form.matricNo} onChange={(e) => setForm({ ...form, matricNo: e.target.value })}
                icon={<BookOpen className="w-4 h-4" />}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-dark/80">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full h-10 rounded-lg border border-border bg-white px-3 text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <Input
                id="password" label="Password" type="password" placeholder="At least 6 characters"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                icon={<Lock className="w-4 h-4" />}
              />
              <Input
                id="confirmPassword" label="Confirm Password" type="password" placeholder="Repeat password"
                value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                icon={<Lock className="w-4 h-4" />}
              />

              <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
                <UserPlus className="w-4 h-4" />
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted">
                Already have an account?{" "}
                <button type="button" onClick={() => router.push("/login")} className="text-primary hover:underline font-medium cursor-pointer bg-transparent border-none p-0">
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
