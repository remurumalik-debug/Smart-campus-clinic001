"use client";

import { CalendarClock, Bot, ClipboardCheck, Bell } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: CalendarClock,
    title: "Fast Booking",
    description:
      "Book or reschedule appointments in under 30 seconds. No phone calls, no paperwork, no waiting on hold.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description:
      "Get instant answers about symptoms, clinic hours, medication, and more from our intelligent health assistant.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: ClipboardCheck,
    title: "Appointment Tracking",
    description:
      "View your upcoming and past appointments, download receipts, and manage prescriptions all in one place.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Bell,
    title: "Real-time Updates",
    description:
      "Receive instant notifications for confirmations, reminders, queue updates, and doctor availability changes.",
    color: "bg-amber-50 text-amber-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function FeaturesSection() {
  return (
    <section className="bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl">
            Everything you need for{" "}
            <span className="text-primary">stress-free</span> healthcare
          </h2>
          <p className="mt-4 text-lg text-muted">
            Built for students, by students. Our platform takes care of the
            logistics so you can focus on what matters.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group rounded-2xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-card"
            >
              <div
                className={`inline-flex rounded-xl p-3 ${feature.color}`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-dark">
                {feature.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
