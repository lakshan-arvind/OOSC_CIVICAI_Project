"use client";

import type { ChatMessage } from "@/lib/types";

interface ChatHistoryProps {
  messages: ChatMessage[];
  loading?: boolean;
}

function formatTime(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function ChatHistory({ messages, loading }: ChatHistoryProps) {
  if (messages.length === 0 && !loading) return null;

  return (
    <section
      className="mt-6 rounded-md border border-stone-200 bg-white/80 p-4 sm:p-5"
      aria-label="Conversation history"
    >
      <h2 className="font-display text-lg text-stone-900">Conversation</h2>
      <ul className="mt-4 max-h-[min(50vh,420px)] space-y-4 overflow-y-auto pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <li
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-lg px-3 py-2.5 sm:max-w-[85%] sm:px-4 ${
                  isUser
                    ? "bg-teal-800 text-white"
                    : "border border-stone-200 bg-stone-50 text-stone-800"
                }`}
              >
                <p className="text-xs font-medium opacity-80">
                  {isUser ? "You" : "CivicAI"}
                  {msg.created_at && (
                    <span className="ml-2 font-normal">{formatTime(msg.created_at)}</span>
                  )}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
                  {msg.content}
                </p>
              </div>
            </li>
          );
        })}
        {loading && (
          <li className="flex justify-start">
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-teal-800 animate-pulse">
              CivicAI is thinking...
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}
