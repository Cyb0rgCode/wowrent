"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";

type Message = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
};

export function MessageThread({
  conversationId,
  currentUserId,
}: {
  conversationId: string;
  currentUserId: string;
}) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/messages?conversationId=${conversationId}`,
      { cache: "no-store" },
    );
    if (!res.ok) return;
    const data = await res.json();
    setMessages((prev) => {
      if (prev.length === data.messages.length) return prev;
      return data.messages;
    });
  }, [conversationId]);

  // Initial load + poll every 4s.
  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setBody("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, body: text }),
    });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
    } else {
      setBody(text);
    }
  }

  return (
    <div className="flex h-[60vh] flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            {t.messages.threadEmpty}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      mine ? "text-brand-100" : "text-gray-400"
                    }`}
                  >
                    {formatDateTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-gray-100 p-3"
      >
        <input
          className="input flex-1"
          placeholder={t.messages.inputPlaceholder}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="btn-primary"
        >
          {t.messages.send}
        </button>
      </form>
    </div>
  );
}
