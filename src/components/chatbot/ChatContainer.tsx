"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { cn } from "@/lib/utils";

export default function ChatContainer() {
  const { data: session } = useSession();
  const router = useRouter();

  const {
    messages,
    sendMessage,
    loading,
    chats,
    activeChatId,
    setActiveChatId,
    newChat,
    deleteChat,
  } = useChat((session?.user as any)?.id);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const goBack = () => {
    const role = (session?.user as any)?.role;
    if (role === "admin") router.push("/admin/dashboard");
    else if (role === "clinic_staff") router.push("/clinic-staff/dashboard");
    else router.push("/dashboard");
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setSidebarOpen(false);
        }}
        onNewChat={() => {
          newChat();
          setSidebarOpen(false);
        }}
        onDeleteChat={deleteChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-white">
          <button
            onClick={goBack}
            className="p-1.5 rounded-md hover:bg-gray-100 text-muted transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-md hover:bg-gray-100 text-muted transition-colors"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-dark">Campus Clinic Assistant</h1>
            <p className="text-[11px] text-muted">
              {loading ? "Typing..." : "Ask me anything about campus health"}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                <span className="text-2xl">🏥</span>
              </div>
              <h2 className="text-lg font-semibold text-dark mb-1">
                How can I help you today?
              </h2>
              <p className="text-sm text-muted max-w-sm">
                Ask about clinic hours, appointment scheduling, health services,
                or any campus wellness questions.
              </p>
            </div>
          )}

          {messages.map((message, i) => (
            <ChatMessage
              key={i}
              message={message}
              isTyping={loading && i === messages.length - 1 && message.role === "assistant" && !message.content}
            />
          ))}

          {loading &&
            messages[messages.length - 1]?.role === "assistant" &&
            messages[messages.length - 1]?.content && (
              <div className="flex items-center gap-2 text-xs text-muted mt-1 ml-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Generating response...
              </div>
            )}

          <div ref={bottomRef} />
        </div>

        <ChatInput onSend={sendMessage} loading={loading} />
      </div>
    </div>
  );
}
