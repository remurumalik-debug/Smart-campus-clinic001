"use client";

import { Users, CalendarCheck, Heart, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { icon: Users, value: "500+", label: "Students Served" },
  { icon: CalendarCheck, value: "50+", label: "Appointments Daily" },
  { icon: Heart, value: "95%", label: "Satisfaction Rate" },
  { icon: Stethoscope, value: "10+", label: "Clinic Doctors" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function StatsSection() {
  return (
    <section className="bg-gradient-to-br from-primary via-primary-dark to-secondary px-6 py-20 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="flex flex-col items-center rounded-2xl bg-white/10 px-6 py-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white">
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {stat.value}
              </span>
              <span className="mt-1 text-sm font-medium text-white/80">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
