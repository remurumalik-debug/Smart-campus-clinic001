"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { marked } from "marked";

interface Props {
  message: { role: string; content: string };
  isTyping?: boolean;
}

export default function ChatMessage({ message, isTyping }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const htmlContent = marked.parse(message.content, { async: false }) as string;

  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "group relative max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-dark text-white rounded-br-md"
            : "bg-gray-50 text-dark border-l-4 border-primary rounded-bl-md"
        )}
      >
        {isTyping ? (
          <div className="flex items-center gap-1 py-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <div
            className={cn(
              "chat-message text-sm leading-relaxed",
              isUser ? "text-white" : "text-dark"
            )}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}

        {!isTyping && (
          <button
            onClick={handleCopy}
            className={cn(
              "absolute -bottom-8 right-0 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
              isUser ? "hover:bg-gray-100" : "hover:bg-gray-200"
            )}
            title="Copy message"
          >
            {copied ? (
              <span className="text-[10px] text-primary font-medium">Copied!</span>
            ) : (
              <Copy size={13} className="text-muted" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
