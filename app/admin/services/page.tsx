"use client";
// src/app/(admin)/admin/services/page.tsx
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical, Save } from "lucide-react";

const ICON_OPTIONS = [
  "BookOpen", "FlaskConical", "Briefcase", "GraduationCap",
  "Laptop", "Globe", "Heart", "Users", "Building", "Library",
];

interface Service {
  id: number; name: string; slug: string; description: string;
  icon: string; imageUrl: string; sortOrder: number; isActive: boolean;
}

const blank = (): Partial<Service> => ({
  name: "", description: "", icon: "BookOpen", imageUrl: "", sortOrder: 0, isActive: true,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<Partial<Service> | null>(null);
  const [editId, setEditId]     = useState<number | "new" | null>(null);
  const [saving, setSaving]     = useState(false);

  async function load() {
    const res  = await fetch("/api/services");
    const json = await res.json();
    setServices(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    const method = editId === "new" ? "POST" : "PUT";
    const url    = editId === "new" ? "/api/services" : `/api/services/${editId}`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    setEditId(null);
    setEditing(null);
    load();
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    load();
  }

  function openEdit(svc: Service) {
    setEditing({ ...svc });
    setEditId(svc.id);
  }

  const inp = "w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-navy bg-white transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>
            Student Services
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">{services.length} services</p>
        </div>
        <button onClick={() => { setEditing(blank()); setEditId("new"); }}
          className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Modal */}
      {editId !== null && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="p-6">
              <h2 className="font-playfair font-bold text-lg mb-5" style={{ color: "var(--clr-navy)" }}>
                {editId === "new" ? "Add Service" : "Edit Service"}
              </h2>
              <div className="space-y-4">
                <Field label="Service Name *">
                  <input required value={editing.name ?? ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className={inp} placeholder="e.g. Library Service" />
                </Field>
                <Field label="Description">
                  <textarea rows={3} value={editing.description ?? ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    className={`${inp} resize-none`} />
                </Field>
                <Field label="Icon (Lucide name)">
                  <select value={editing.icon ?? "BookOpen"}
                    onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                    className={inp}>
                    {ICON_OPTIONS.map((ic) => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Image URL">
                  <input value={editing.imageUrl ?? ""}
                    onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value || "" })}
                    className={inp} placeholder="/uploads/images/..." />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Sort Order">
                    <input type="number" value={editing.sortOrder ?? 0}
                      onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })}
                      className={inp} />
                  </Field>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={!!editing.isActive}
                        onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
                      Active (visible on website)
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} disabled={saving}
                  className="btn-primary flex-1 justify-center disabled:opacity-60">
                  <Save className="w-4 h-4" />
                  {saving ? "Saving…" : "Save Service"}
                </button>
                <button onClick={() => { setEditId(null); setEditing(null); }}
                  className="btn-outline flex-1 justify-center">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards grid */}
      {loading ? (
        <p className="text-stone-400 text-sm">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <div key={s.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ background: "var(--clr-stone)", color: "var(--clr-navy)" }}>
                    {s.icon?.[0] ?? "S"}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--clr-navy)" }}>{s.name}</p>
                    <p className="text-xs text-stone-400">Order: {s.sortOrder}</p>
                  </div>
                </div>
                <GripVertical className="w-4 h-4 text-stone-200 shrink-0 mt-1" />
              </div>

              {s.description && (
                <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{s.description}</p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <span className={`badge text-xs ${s.isActive ? "badge-green" : "badge-yellow"}`}>
                  {s.isActive ? "Active" : "Inactive"}
                </span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => openEdit(s)}
                    className="p-1.5 rounded hover:bg-blue-50 text-stone-400 hover:text-blue-500 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(s.id, s.name)}
                    className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="col-span-full text-center py-16 text-stone-400">
              <p className="text-sm">No services yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
