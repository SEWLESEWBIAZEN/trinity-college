"use client";
// src/app/(admin)/admin/messages/page.tsx
import { useState, useEffect } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";

interface Message {
  id: number; name: string; email: string; phone: string;
  subject: string; message: string; isRead: boolean; createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading]   = useState(true);

  async function load() {
    const res = await fetch("/api/messages");
    const j   = await res.json();
    setMessages(j.data ?? []);
    setLoading(false);
  }

  async function markRead(id: number) {
    await fetch(`/api/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    setSelected(null);
    load();
  }

  function openMessage(m: Message) {
    setSelected(m);
    if (!m.isRead) markRead(m.id);
  }

  useEffect(() => { load(); }, []);

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>
          Messages
        </h1>
        <p className="text-stone-500 text-sm mt-0.5">
          {unread} unread · {messages.length} total
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="card overflow-hidden divide-y divide-stone-100">
          {loading && <p className="p-5 text-stone-400 text-sm">Loading…</p>}
          {!loading && messages.length === 0 && (
            <div className="p-10 text-center">
              <Mail className="w-8 h-8 text-stone-200 mx-auto mb-2" />
              <p className="text-stone-400 text-sm">No messages yet.</p>
            </div>
          )}
          {messages.map((m) => (
            <button key={m.id} onClick={() => openMessage(m)}
              className={`w-full text-left px-4 py-3.5 hover:bg-stone-50 transition-colors
                ${selected?.id === m.id ? "bg-stone-50 border-l-2" : "border-l-2 border-transparent"}`}
              style={selected?.id === m.id ? { borderLeftColor: "var(--clr-navy)" } : undefined}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {!m.isRead && (
                    <span className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: "var(--clr-gold)" }} />
                  )}
                  <p className={`text-sm truncate ${!m.isRead ? "font-semibold" : "font-medium"}`}
                    style={{ color: "var(--clr-navy)" }}>
                    {m.name}
                  </p>
                </div>
                <p className="text-xs text-stone-300 shrink-0">
                  {new Date(m.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-xs text-stone-400 mt-0.5 truncate pl-4">{m.subject ?? "No subject"}</p>
            </button>
          ))}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-playfair text-lg font-bold" style={{ color: "var(--clr-navy)" }}>
                  {selected.subject ?? "No subject"}
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                  From: <strong>{selected.name}</strong>
                  {selected.email && <> · <a href={`mailto:${selected.email}`} className="underline">{selected.email}</a></>}
                  {selected.phone && <> · {selected.phone}</>}
                </p>
                <p className="text-xs text-stone-300 mt-1">
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-stone-400">
                  {selected.isRead ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  {selected.isRead ? "Read" : "Unread"}
                </span>
                <button onClick={() => handleDelete(selected.id)}
                  className="p-2 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="prose-content bg-stone-50 rounded-xl p-5 text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
              {selected.message}
            </div>
            {selected.email && (
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject ?? ""}`}
                className="btn-primary mt-5 inline-flex">
                Reply by Email
              </a>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 card flex items-center justify-center p-20">
            <div className="text-center text-stone-300">
              <Mail className="w-12 h-12 mx-auto mb-3" />
              <p className="text-sm">Select a message to read it</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
