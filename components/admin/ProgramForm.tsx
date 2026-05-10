"use client";
// src/components/admin/ProgramForm.tsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

interface Category { id: number; name: string }
interface ProgramData {
  categoryId?: number | null;
  name: string;
  degreeType: "certificate" | "diploma" | "bachelor" | "master" | "phd";
  durationYears?: number | null;
  description?: string;
  objectives?: string;
  careerOutcomes?: string;
  admissionReq?: string;
  thumbnailUrl?: string | null;
  isPublished: boolean;
  sortOrder: number;
}

const DEGREE_TYPES = ["certificate","diploma","bachelor","master","phd"];

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

export default function ProgramForm({
  programId,
  initial,
}: {
  programId?: number;
  initial?: ProgramData;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProgramData>(
    initial ?? {
      categoryId: null, name: "", degreeType: "bachelor",
      durationYears: 4, description: "", objectives: "",
      careerOutcomes: "", admissionReq: "",
      thumbnailUrl: null, isPublished: false, sortOrder: 0,
    }
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/programs/categories")
      .then((r) => r.json())
      .then((j) => setCategories(j.data ?? []));
  }, []);

  async function uploadThumb(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", form.name || file.name);
    const res = await fetch("/api/media", { method: "POST", body: fd });
    const json = await res.json();
    setUploading(false);
    if (json.url) setForm((f) => ({ ...f, thumbnailUrl: json.url }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = programId ? `/api/programs/${programId}` : "/api/programs";
      const method = programId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      router.push("/admin/programs");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const input = "w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-navy transition-colors bg-white";
  const textarea = `${input} resize-none`;

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/programs" className="p-2 rounded-lg hover:bg-stone-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>
            {programId ? "Edit Program" : "New Program"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="w-4 h-4 rounded" />
            Publish
          </label>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Program"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 space-y-5">
            <Field label="Program Name *">
              <input required value={form.name} placeholder="e.g. Bachelor of Science in Nursing"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={input} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Degree Type *">
                <select value={form.degreeType}
                  onChange={(e) => setForm({ ...form, degreeType: e.target.value as ProgramData["degreeType"] })}
                  className={input}>
                  {DEGREE_TYPES.map((d) => (
                    <option key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Duration (years)">
                <input type="number" step="0.5" min="0.5" max="10"
                  value={form.durationYears ?? ""}
                  onChange={(e) => setForm({ ...form, durationYears: e.target.value ? Number(e.target.value) : null })}
                  className={input} />
              </Field>
            </div>
            <Field label="Description">
              <textarea rows={4} value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Program overview…" className={textarea} />
            </Field>
            <Field label="Learning Objectives">
              <textarea rows={4} value={form.objectives ?? ""}
                onChange={(e) => setForm({ ...form, objectives: e.target.value })}
                placeholder="What students will learn…" className={textarea} />
            </Field>
            <Field label="Career Outcomes">
              <textarea rows={3} value={form.careerOutcomes ?? ""}
                onChange={(e) => setForm({ ...form, careerOutcomes: e.target.value })}
                placeholder="Career paths for graduates…" className={textarea} />
            </Field>
            <Field label="Admission Requirements">
              <textarea rows={3} value={form.admissionReq ?? ""}
                onChange={(e) => setForm({ ...form, admissionReq: e.target.value })}
                placeholder="Specific requirements for this program…" className={textarea} />
            </Field>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-sm" style={{ color: "var(--clr-navy)" }}>Organization</h3>
            <Field label="Category">
              <select value={form.categoryId ?? ""}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value ? Number(e.target.value) : null })}
                className={input}>
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Sort Order">
              <input type="number" min="0" value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className={input} />
            </Field>
          </div>

          {/* Thumbnail */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--clr-navy)" }}>Thumbnail</h3>
            {form.thumbnailUrl ? (
              <div className="relative">
                <img src={form.thumbnailUrl} alt="Thumbnail"
                  className="w-full h-36 object-cover rounded-lg" />
                <button type="button"
                  onClick={() => setForm((f) => ({ ...f, thumbnailUrl: null }))}
                  className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-50 transition-colors">
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-stone-200 rounded-lg cursor-pointer hover:border-stone-400 transition-colors">
                <Upload className="w-6 h-6 text-stone-300 mb-2" />
                <span className="text-xs text-stone-400">
                  {uploading ? "Uploading…" : "Click to upload"}
                </span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadThumb(e.target.files[0])} />
              </label>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
