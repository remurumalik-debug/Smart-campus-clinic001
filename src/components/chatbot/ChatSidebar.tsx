"use client";

import { MessageSquare, Plus, Trash2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  updatedAt: Date;
}

interface Props {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onToggle,
}: Props) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => onToggle()}
        />
      )}

      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-border flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-dark">Chat History</h2>
          <button
            onClick={onToggle}
            className="md:hidden p-1 rounded-md hover:bg-gray-100 text-muted transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <button
          onClick={onNewChat}
          className="mx-3 mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          New Chat
        </button>

        <nav className="flex-1 overflow-y-auto scrollbar-thin mt-2 px-2">
          {chats.length === 0 && (
            <p className="text-xs text-muted text-center mt-8">
              No conversations yet
            </p>
          )}

          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm mb-0.5",
                activeChatId === chat.id
                  ? "bg-primary-light text-primary-dark font-medium"
                  : "text-dark hover:bg-gray-50"
              )}
            >
              <MessageSquare
                size={15}
                className={cn(
                  "shrink-0",
                  activeChatId === chat.id ? "text-primary" : "text-muted"
                )}
              />
              <span className="truncate flex-1">{chat.title || "New Chat"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-muted hover:text-red-500 transition-all"
                title="Delete chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
