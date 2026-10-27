"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Chat {
  id: string;
  title: string;
  updatedAt: Date;
}

export function useChat(userId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prevUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (userId !== prevUserIdRef.current) {
      prevUserIdRef.current = userId;
      setMessages([]);
      setActiveChatId(null);
      setLoading(false);
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }

      if (userId) {
        const stored = localStorage.getItem(`chatList_${userId}`);
        if (stored) {
          try {
            setChats(JSON.parse(stored) as Chat[]);
          } catch {
            setChats([]);
          }
        } else {
          setChats([]);
        }
      } else {
        setChats([]);
      }
    }
  }, [userId]);

  const persistChats = useCallback(
    (updated: Chat[]) => {
      setChats(updated);
      if (userId) {
        localStorage.setItem(`chatList_${userId}`, JSON.stringify(updated));
      }
    },
    [userId]
  );

  const loadChat = useCallback(async (chatId: string) => {
    setActiveChatId(chatId);
    setLoading(true);
    try {
      const res = await fetch(`/api/chat?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const newChat = useCallback(() => {
    setMessages([]);
    setActiveChatId(null);
  }, []);

  const deleteChat = useCallback(
    async (chatId: string) => {
      const updated = chats.filter((c) => c.id !== chatId);
      persistChats(updated);
      if (activeChatId === chatId) {
        setMessages([]);
        setActiveChatId(null);
      }
      try {
        await fetch(`/api/chat?chatId=${chatId}`, { method: "DELETE" });
      } catch {
        /* ignore */
      }
    },
    [chats, activeChatId, persistChats]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = { role: "user", content };
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      const chatId = activeChatId || crypto.randomUUID();
      if (!activeChatId) {
        setActiveChatId(chatId);
        const newChatEntry: Chat = {
          id: chatId,
          title: content.slice(0, 40) + (content.length > 40 ? "..." : ""),
          updatedAt: new Date(),
        };
        persistChats([newChatEntry, ...chats]);
      }

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            chatId,
            history: messages.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error("Failed to send message");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader available");

        const decoder = new TextDecoder();
        let assistantContent = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const delta =
                parsed.choices?.[0]?.delta?.content ||
                parsed.choices?.[0]?.text ||
                "";
              assistantContent += delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            } catch {
              /* ignore parse errors for partial chunks */
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [activeChatId, messages, chats, persistChats]
  );

  return {
    messages,
    sendMessage,
    loading,
    chats,
    activeChatId,
    setActiveChatId: loadChat,
    newChat,
    deleteChat,
  };
}
