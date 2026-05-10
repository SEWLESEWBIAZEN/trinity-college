"use client";
// src/app/(admin)/admin/announcements/page.tsx
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Pin, Eye, EyeOff, Save, ArrowLeft, X } from "lucide-react";

type Category = "news" | "event" | "notice" | "scholarship";

interface Announcement {
  id: number; title: string; slug: string; excerpt: string; body: string;
  coverUrl: string; category: Category; eventDate: string;
  isPublished: boolean; isPinned: boolean;
  publishedAt: string; createdAt: string; authorName: string;
}

const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: "news",        label: "News",        color: "badge-navy"   },
  { value: "event",       label: "Event",       color: "badge-gold"   },
  { value: "notice",      label: "Notice",      color: "badge-yellow" },
  { value: "scholarship", label: "Scholarship", color: "badge-green"  },
];

const blank = (): Partial<Announcement> => ({
  title: "", excerpt: "", body: "", coverUrl: "", category: "news",
  eventDate: "", isPublished: false, isPinned: false,
});

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  const [items, setItems]       = useState<Announcement[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editId, setEditId]     = useState<number | "new" | null>(null);
  const [form, setForm]         = useState<Partial<Announcement>>(blank());
  const [saving, setSaving]     = useState(false);
  const [filterCat, setFilter]  = useState<Category | "all">("all");
  const [error, setError]       = useState("");

  async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const res = await fetch(input, init);
    const text = await res.text();

    let json: unknown = {};
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("Server returned an invalid response. Please try again.");
      }
    }

    if (!res.ok) {
      const apiError =
        typeof json === "object" && json && "error" in json
          ? String((json as { error?: unknown }).error ?? "")
          : "";
      throw new Error(apiError || `Request failed (${res.status})`);
    }

    return json as T;
  }

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const json = await requestJson<{ data?: Announcement[] }>("/api/announcements?limit=50");
      setItems(json.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load announcements");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openEdit(id: number) {
    try {
      setError("");
      const json = await requestJson<{ data: Partial<Announcement> }>(`/api/announcements/${id}`);
      setForm({
        ...json.data,
        isPublished: !!json.data.isPublished,
        isPinned: !!json.data.isPinned,
      });
      setEditId(id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load announcement");
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      const method = editId === "new" ? "POST" : "PUT";
      const url = editId === "new" ? "/api/announcements" : `/api/announcements/${editId}`;
      await requestJson(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEditId(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      setError("");
      await requestJson(`/api/announcements/${id}`, { method: "DELETE" });
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete announcement");
    }
  }

  async function togglePublish(item: Announcement) {
    try {
      setError("");
      await requestJson(`/api/announcements/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, isPublished: !item.isPublished }),
      });
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update announcement status");
    }
  }

  const filtered = filterCat === "all" ? items : items.filter((a) => a.category === filterCat);

  const inp = "w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-navy bg-white transition-colors";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>
            Announcements
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">{items.length} total</p>
        </div>
        <button onClick={() => { setForm(blank()); setEditId("new"); }}
          className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {(["all", ...CATEGORIES.map((c) => c.value)] as const).map((cat) => (
          <button key={cat}
            onClick={() => setFilter(cat as Category | "all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize
              ${filterCat === cat
                ? "text-white border-transparent"
                : "border-stone-200 text-stone-500 hover:border-stone-400"}`}
            style={filterCat === cat ? { background: "var(--clr-navy)" } : undefined}>
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-stone-400 text-sm">Loading…</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: "var(--clr-stone)" }}>
              <tr>
                {["Title", "Category", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((a) => {
                const catMeta = CATEGORIES.find((c) => c.value === a.category);
                return (
                  <tr key={a.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {a.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                        <span className="font-medium line-clamp-1" style={{ color: "var(--clr-navy)" }}>
                          {a.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge text-xs capitalize ${catMeta?.color ?? "badge-navy"}`}>
                        {a.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-400 text-xs">
                      {a.eventDate
                        ? new Date(a.eventDate).toLocaleDateString()
                        : a.publishedAt
                        ? new Date(a.publishedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge text-xs ${a.isPublished ? "badge-green" : "badge-yellow"}`}>
                        {a.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => togglePublish(a)}
                          className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                          title={a.isPublished ? "Unpublish" : "Publish"}>
                          {a.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => openEdit(a.id)}
                          className="p-1.5 rounded hover:bg-blue-50 text-stone-400 hover:text-blue-500 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(a.id, a.title)}
                          className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="px-5 py-12 text-center text-stone-400 text-sm">No announcements found.</p>
          )}
        </div>
      )}

      {/* Slide-over editor */}
      {editId !== null && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/40" onClick={() => setEditId(null)} />

          {/* Panel */}
          <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                <button onClick={() => setEditId(null)} className="p-1.5 rounded hover:bg-stone-100 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-stone-500" />
                </button>
                <h2 className="font-playfair font-bold" style={{ color: "var(--clr-navy)" }}>
                  {editId === "new" ? "New Announcement" : "Edit Announcement"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={!!form.isPinned}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} />
                  <Pin className="w-3.5 h-3.5 text-amber-500" /> Pin
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={!!form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
                  Publish
                </label>
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm disabled:opacity-60">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving…" : "Save"}
                </button>
                <button onClick={() => setEditId(null)} className="p-1.5 rounded hover:bg-stone-100 transition-colors">
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              </div>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <Field label="Title *" full>
                  <input required value={form.title ?? ""}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className={inp} placeholder="Announcement title" />
                </Field>

                <Field label="Category">
                  <select value={form.category ?? "news"}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                    className={inp}>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Event Date">
                  <input type="date" value={form.eventDate ?? ""}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value ?? undefined })}
                    className={inp} />
                </Field>

                <Field label="Excerpt" full>
                  <textarea rows={2} value={form.excerpt ?? ""}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    className={`${inp} resize-none`}
                    placeholder="Short summary shown in cards…" />
                </Field>

                <Field label="Cover Image URL" full>
                  <input value={form.coverUrl ?? ""}
                    onChange={(e) => setForm({ ...form, coverUrl: e.target.value ?? undefined })}
                    className={inp} placeholder="/uploads/images/..." />
                </Field>

                <Field label="Full Body" full>
                  <textarea rows={12} value={form.body ?? ""}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    className={`${inp} resize-none`}
                    placeholder="Full announcement content…" />
                </Field>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
