"use client";

import { Send } from "lucide-react";
import { useRef, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (message: string) => void;
  loading: boolean;
}

export default function ChatInput({ onSend, loading }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 4 * 24)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-white p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            disabled={loading}
            className={cn(
              "w-full resize-none rounded-xl border border-border bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition-colors placeholder:text-muted",
              "focus:border-primary focus:ring-1 focus:ring-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            style={{ maxHeight: "96px" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!value.trim() || loading}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors",
            value.trim() && !loading
              ? "bg-primary text-white hover:bg-primary-dark"
              : "bg-gray-100 text-muted cursor-not-allowed"
          )}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
