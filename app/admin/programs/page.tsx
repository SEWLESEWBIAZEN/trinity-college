// src/app/(admin)/admin/programs/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface Program {
  id: number; name: string; degreeType: string; durationYears: number;
  categoryName: string; isPublished: boolean; slug: string;
}

type ProgramApiRow = Record<string, unknown>;

function normalizeProgramRow(row: ProgramApiRow): Program {
  return {
    id: Number(row.id ?? 0),
    name: String(row.name ?? ""),
    degreeType: String(row.degreeType ?? row.degree_type ?? ""),
    durationYears: Number(row.durationYears ?? row.duration_years ?? 0),
    categoryName: String(row.categoryName ?? ""),
    isPublished: Boolean(row.isPublished ?? row.is_published),
    slug: String(row.slug ?? ""),
  };
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/programs?limit=50");
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(
          json?.error || `Failed to load programs (HTTP ${res.status}).`
        );
      }

      const normalized = Array.isArray(json?.data)
        ? json.data.map((row: ProgramApiRow) => normalizeProgramRow(row))
        : [];
      setPrograms(normalized);
    } catch (e) {
      setPrograms([]);
      setError(
        e instanceof Error ? e.message : "Failed to load programs."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          payload?.error ??
          (res.status === 401
            ? "Your session expired. Please log in again."
            : "Failed to delete program.");
        setError(message);
        if (res.status === 401) window.location.href = "/admin/login";
        return;
      }
      load();
    } catch {
      setError("Network error while deleting program.");
    }
  }

  async function togglePublish(p: Program) {
    try {
      const detailsRes = await fetch(`/api/programs/${p.id}`);
      const detailsPayload = await detailsRes.json().catch(() => null);
      if (!detailsRes.ok || !detailsPayload?.data) {
        const message =
          detailsPayload?.error ??
          (detailsRes.status === 401
            ? "Your session expired. Please log in again."
            : "Failed to load program details.");
        setError(message);
        if (detailsRes.status === 401) window.location.href = "/admin/login";
        return;
      }

      const data = detailsPayload.data as ProgramApiRow;
      const res = await fetch(`/api/programs/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: data.categoryId ?? data.category_id ?? null,
          name: data.name ?? p.name,
          degreeType: data.degreeType ?? data.degree_type,
          durationYears: data.durationYears ?? data.duration_years ?? null,
          description: data.description ?? "",
          objectives: data.objectives ?? "",
          careerOutcomes: data.careerOutcomes ?? data.career_outcomes ?? "",
          admissionReq: data.admissionReq ?? data.admission_req ?? "",
          thumbnailUrl: data.thumbnailUrl ?? data.thumbnail_url ?? null,
          isPublished: !Boolean(data.isPublished ?? data.is_published),
          sortOrder: data.sortOrder ?? data.sort_order ?? 0,
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          payload?.error ??
          (res.status === 401
            ? "Your session expired. Please log in again."
            : "Failed to update program.");
        setError(message);
        if (res.status === 401) window.location.href = "/admin/login";
        return;
      }
      load();
    } catch {
      setError("Network error while updating program.");
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>
            Programs
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">{programs.length} total</p>
        </div>
        <Link href="/admin/programs/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> Add Program
        </Link>
      </div>

      {loading ? (
        <div className="text-stone-400 text-sm">Loading…</div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ background: "var(--clr-stone)" }}>
                <tr>
                  {["Program Name", "Category", "Degree", "Duration", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {programs.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium" style={{ color: "var(--clr-navy)" }}>
                      {p.name}
                    </td>
                    <td className="px-5 py-3.5 text-stone-500">{p.categoryName ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="badge badge-navy text-xs capitalize">{p.degreeType}</span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-500">
                      {p.durationYears ? `${p.durationYears} yr` : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge text-xs ${p.isPublished ? "badge-green" : "badge-yellow"}`}>
                        {p.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => togglePublish(p)}
                          className="p-1.5 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
                          title={p.isPublished ? "Unpublish" : "Publish"}>
                          {p.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <Link href={`/admin/programs/${p.id}/edit`}
                          className="p-1.5 rounded hover:bg-blue-50 text-stone-400 hover:text-blue-600 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {programs.length === 0 && (
              <p className="px-5 py-10 text-center text-stone-400 text-sm">
                No programs yet. <Link href="/admin/programs/new" className="underline">Add one.</Link>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
