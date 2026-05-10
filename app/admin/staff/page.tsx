"use client";
// src/app/(admin)/admin/staff/page.tsx
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";

interface Staff {
  id: number; fullName: string; title: string; position: string;
  department: string; email: string; photoUrl: string; isPublished: boolean;
}

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

export default function AdminStaffPage() {
  const [staff, setStaff]   = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Partial<Staff & { bio: string; phone: string; sortOrder: number }>>({
    fullName: "", title: "", position: "", department: "",
    bio: "", email: "", phone: "", photoUrl: "", isPublished: true, sortOrder: 0,
  });

  const load = async () => {
    const res = await fetch("/api/staff");
    const j   = await res.json();
    setStaff(j.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  async function handleSave() {
    const method = editingId === "new" ? "POST" : "PUT";
    const url    = editingId === "new" ? "/api/staff" : `/api/staff/${editingId}`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditingId(null);
    load();
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/staff/${id}`, { method: "DELETE" });
    load();
  }

  const input = "w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-navy bg-white";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>Staff & Faculty</h1>
          <p className="text-stone-500 text-sm mt-0.5">{staff.length} members</p>
        </div>
        <button onClick={() => { setForm({ fullName:"",title:"",position:"",department:"",bio:"",email:"",phone:"",photoUrl:"",isPublished:true,sortOrder:0 }); setEditingId("new"); }}
          className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Form modal */}
      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl overflow-y-auto max-h-[90vh]">
            <h2 className="font-playfair font-bold text-lg mb-5" style={{ color: "var(--clr-navy)" }}>
              {editingId === "new" ? "Add Staff Member" : "Edit Staff Member"}
            </h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name *">
                  <input required value={form.fullName ?? ""} className={input}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </Field>
                <Field label="Title (Dr., Prof.)">
                  <input value={form.title ?? ""} className={input} placeholder="e.g. Dr."
                    onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Position">
                  <input value={form.position ?? ""} className={input} placeholder="Academic Dean"
                    onChange={(e) => setForm({ ...form, position: e.target.value })} />
                </Field>
                <Field label="Department">
                  <input value={form.department ?? ""} className={input} placeholder="Health Sciences"
                    onChange={(e) => setForm({ ...form, department: e.target.value })} />
                </Field>
              </div>
              <Field label="Bio">
                <textarea rows={3} value={form.bio ?? ""} className={`${input} resize-none`}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Email">
                  <input type="email" value={form.email ?? ""} className={input}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <input value={form.phone ?? ""} className={input}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </Field>
              </div>
              <Field label="Photo URL">
                <input value={form.photoUrl ?? ""} className={input} placeholder="/uploads/images/..."
                  onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
              </Field>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.isPublished ?? true}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
                Published (visible on website)
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="btn-primary flex-1 justify-center">Save</button>
              <button onClick={() => setEditingId(null)} className="btn-outline flex-1 justify-center">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? <div className="text-stone-400 text-sm">Loading…</div> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: "var(--clr-stone)" }}>
              <tr>
                {["Name", "Position", "Department", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {s.photoUrl ? (
                        <img src={s.photoUrl} alt={s.fullName}
                          className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ background: "var(--clr-navy)" }}>
                          {s.fullName[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium" style={{ color: "var(--clr-navy)" }}>
                          {s.title ? `${s.title} ` : ""}{s.fullName}
                        </p>
                        <p className="text-xs text-stone-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-stone-500">{s.position ?? "—"}</td>
                  <td className="px-5 py-3.5 text-stone-500">{s.department ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge text-xs ${s.isPublished ? "badge-green" : "badge-yellow"}`}>
                      {s.isPublished ? "Published" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setForm(s as typeof form); setEditingId(s.id); }}
                        className="p-1.5 rounded hover:bg-blue-50 text-stone-400 hover:text-blue-500 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id, s.fullName)}
                        className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 && (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-400 text-sm">No staff added yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
