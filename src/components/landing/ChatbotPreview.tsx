"use client";

import { Bot, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const messages = [
  {
    role: "user",
    text: "Hi! I have a bad headache and fever. Can I see a doctor today?",
  },
  {
    role: "assistant",
    text: "I'm sorry you're not feeling well. Let me check available slots... We have an opening with Dr. Sarah at 3:30 PM today. Would you like me to book it?",
  },
  {
    role: "user",
    text: "Yes, please! That works perfectly.",
  },
  {
    role: "assistant",
    text: "Great! Your appointment is confirmed for today at 3:30 PM with Dr. Sarah in Room 204. You'll receive a reminder 30 minutes before. Feel better soon! 🌿",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function ChatbotPreview() {
  return (
    <section className="bg-accent px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl">
            Meet your <span className="text-primary">AI Health Assistant</span>
          </h2>
          <p className="mt-4 text-lg text-muted">
            Get instant help with bookings, symptoms, and clinic info — just
            like chatting with a friend.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-16 max-w-2xl"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
            <div className="flex items-center gap-3 border-b border-border bg-white px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-dark">
                    AI Health Assistant
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-2 py-0.5 text-[11px] font-medium text-primary-dark">
                    <Sparkles className="h-3 w-3" />
                    Online
                  </span>
                </div>
                <p className="text-xs text-muted">Typically replies instantly</p>
              </div>
            </div>

            <div className="space-y-4 bg-[#fafbfc] p-5">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4"
              >
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    variants={messageVariants}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[85%] items-start gap-2.5 ${
                        msg.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          msg.role === "user"
                            ? "bg-dark text-white"
                            : "bg-primary text-white"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary text-white"
                            : "border border-border bg-white text-dark"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex items-center gap-2 border-t border-border pt-3">
                <div className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-muted">
                  Type your message...
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
