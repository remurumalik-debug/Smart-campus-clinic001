"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Aisha M.",
    avatar: "AM",
    role: "Computer Science, Year 3",
    comment:
      "The AI assistant booked my appointment in seconds. I didn't have to wait on hold or fill out any forms. This is a game-changer for busy students.",
    rating: 5,
  },
  {
    name: "James K.",
    avatar: "JK",
    role: "Mechanical Engineering, Year 2",
    comment:
      "I love how I can track all my appointments in one place. The reminders are a lifesaver — I've never missed a check-up since using this system.",
    rating: 5,
  },
  {
    name: "Priya S.",
    avatar: "PS",
    role: "Biology, Year 4",
    comment:
      "Finally, a clinic booking system that actually understands student life. Fast, intuitive, and the AI chat is surprisingly helpful for symptom questions.",
    rating: 4,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function TestimonialsSection() {
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
            Loved by <span className="text-primary">students</span> across
            campus
          </h2>
          <p className="mt-4 text-lg text-muted">
            Here&apos;s what your fellow students have to say about their
            experience.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              className="group rounded-2xl border border-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-dark">{t.name}</h4>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < t.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>

              <p className="mt-4 leading-relaxed text-muted">
                &ldquo;{t.comment}&rdquo;
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
