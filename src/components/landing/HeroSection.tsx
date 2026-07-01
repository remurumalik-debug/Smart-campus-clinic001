"use client";

import { Calendar, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-primary-light/30 to-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-sm font-medium text-primary-dark">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Campus Healthcare Made Simple
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-dark sm:text-5xl lg:text-6xl">
              Book Campus Clinic{" "}
              <span className="text-primary">Appointments</span> in Minutes
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              Smart healthcare scheduling powered by AI. Skip the queues, book
              online, and get the care you need — anytime, anywhere.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-dark hover:shadow-xl active:scale-[0.97]"
              >
                <Calendar className="h-5 w-5" />
                Book Appointment
              </a>
              <a
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary/20 bg-white px-8 py-3.5 text-base font-semibold text-primary transition-all hover:border-primary/40 hover:bg-primary-light/50 active:scale-[0.97]"
              >
                <MessageCircle className="h-5 w-5" />
                Try AI Assistant
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary-light/40 to-secondary/20 blur-3xl" />
              <svg
                viewBox="0 0 400 400"
                className="relative h-72 w-72 sm:h-80 sm:w-80 lg:h-96 lg:w-96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="200" cy="200" r="180" className="fill-primary-light/60" />
                <circle cx="200" cy="200" r="140" className="fill-white/80" />
                <circle cx="200" cy="200" r="180" stroke="currentColor" className="stroke-primary/20" strokeWidth="2" />

                <path
                  d="M200 60 Q260 100 280 160 Q300 220 260 280 Q220 340 200 340 Q180 340 140 280 Q100 220 120 160 Q140 100 200 60Z"
                  className="fill-primary/10"
                />

                <path
                  d="M160 200 L185 220 L240 170"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-sm"
                />

                <circle cx="200" cy="200" r="80" stroke="#10B981" strokeWidth="2" strokeDasharray="6 6" className="opacity-40" />

                <g className="opacity-30">
                  <circle cx="120" cy="130" r="6" fill="#10B981" />
                  <circle cx="280" cy="130" r="6" fill="#10B981" />
                  <circle cx="100" cy="250" r="4" fill="#14B8A6" />
                  <circle cx="300" cy="250" r="4" fill="#14B8A6" />
                  <circle cx="200" cy="80" r="5" fill="#10B981" />
                  <circle cx="200" cy="320" r="5" fill="#10B981" />
                </g>
              </svg>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute -bottom-6 left-1/2 h-32 w-[120%] -translate-x-1/2 rounded-[50%] bg-gradient-to-t from-primary/5 to-transparent" />
    </section>
  );
}
