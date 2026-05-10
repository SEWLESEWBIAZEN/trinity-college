"use client";
// src/app/(admin)/admin/admissions/page.tsx
import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Save } from "lucide-react";

interface Req {
  id?: number; groupName: string; title: string; description: string;
  sortOrder: number; isActive: boolean;
}

const GROUPS = [
  { value: "general",   label: "General Requirements" },
  { value: "foreign",   label: "Foreign Applicants" },
  { value: "documents", label: "Required Documents" },
];

const blank = (): Req => ({
  groupName: "general", title: "", description: "", sortOrder: 0, isActive: true,
});

export default function AdminAdmissionsPage() {
  const [items, setItems]     = useState<Req[]>([]);
  const [editing, setEditing] = useState<Req | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/admissions");
    const j   = await res.json();
    setItems(j.data ?? []);
    setLoading(false);
  }

  async function handleSave() {
    if (!editing) return;
    const method = editing.id ? "PUT" : "POST";
    const url    = editing.id ? `/api/admissions/${editing.id}` : "/api/admissions";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    load();
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/admissions/${id}`, { method: "DELETE" });
    load();
  }

  useEffect(() => { load(); }, []);

  const inp = "w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-navy bg-white";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>
            Admission Requirements
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">Manage the requirements shown on the Admissions page.</p>
        </div>
        <button onClick={() => setEditing(blank())} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Requirement
        </button>
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="font-playfair font-bold text-lg mb-5" style={{ color: "var(--clr-navy)" }}>
              {editing.id ? "Edit Requirement" : "Add Requirement"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">Group</label>
                <select value={editing.groupName}
                  onChange={(e) => setEditing({ ...editing, groupName: e.target.value })}
                  className={inp}>
                  {GROUPS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">Title *</label>
                <input required value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className={inp} placeholder="e.g. EHEEE Score" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">Description</label>
                <textarea rows={3} value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className={`${inp} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">Sort Order</label>
                  <input type="number" value={editing.sortOrder}
                    onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                    className={inp} />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editing.isActive}
                      onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
                    Active
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={() => setEditing(null)} className="btn-outline flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* List grouped */}
      {loading ? <p className="text-stone-400 text-sm">Loading…</p> : (
        <div className="space-y-8">
          {GROUPS.map((g) => {
            const groupItems = items.filter((r) => r.groupName === g.value);
            return (
              <div key={g.value}>
                <h2 className="font-playfair font-bold text-lg mb-3"
                  style={{ color: "var(--clr-navy)" }}>{g.label}</h2>
                <div className="card overflow-hidden divide-y divide-stone-100">
                  {groupItems.length === 0 && (
                    <p className="px-5 py-4 text-stone-400 text-sm">No items in this group.</p>
                  )}
                  {groupItems.map((r) => (
                    <div key={r.id} className="px-5 py-3.5 flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm" style={{ color: "var(--clr-navy)" }}>{r.title}</p>
                        {r.description && <p className="text-xs text-stone-500 mt-0.5">{r.description}</p>}
                      </div>
                      <span className={`badge text-xs ${r.isActive ? "badge-green" : "badge-yellow"}`}>
                        {r.isActive ? "Active" : "Inactive"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditing(r)}
                          className="p-1.5 rounded hover:bg-blue-50 text-stone-400 hover:text-blue-500 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => r.id && handleDelete(r.id, r.title)}
                          className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
