"use client";
// src/app/(admin)/admin/media/page.tsx
import { useState, useEffect, useCallback } from "react";
import { Upload, Trash2, Image, FileText, Film, Search } from "lucide-react";

type MediaType = "all" | "image" | "video" | "document";
interface MediaItem {
  id: number; title: string; type: string; url: string;
  thumbnailUrl?: string; mimeType?: string; fileSizeKb?: number; createdAt: string;
}

export default function AdminMediaPage() {
  const [items, setItems]       = useState<MediaItem[]>([]);
  const [filter, setFilter]     = useState<MediaType>("all");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const q = filter !== "all" ? `&type=${filter}` : "";
      const res = await fetch(`/api/media?limit=100${q}`);
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(
          json?.error ?? `Failed to load media (HTTP ${res.status}).`
        );
      }

      setItems(json?.data ?? []);
    } catch (e) {
      setItems([]);
      setError(
        e instanceof Error ? e.message : "Failed to load media."
      );
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(files: FileList) {
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", file.name);
        const res = await fetch("/api/media", { method: "POST", body: fd });
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          const message =
            payload?.error ??
            (res.status === 401
              ? "Your session expired. Please log in again."
              : "Failed to upload file.");
          setError(message);
          if (res.status === 401) window.location.href = "/admin/login";
          break;
        }
      }
    } catch {
      setError("Network error while uploading files.");
    } finally {
      setUploading(false);
      load();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this file permanently?")) return;
    setError("");
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message =
          payload?.error ??
          (res.status === 401
            ? "Your session expired. Please log in again."
            : "Failed to delete file.");
        setError(message);
        if (res.status === 401) window.location.href = "/admin/login";
        return;
      }
      load();
    } catch {
      setError("Network error while deleting file.");
    }
  }

  async function handleDeleteSelected() {
    if (!confirm(`Delete ${selected.size} files permanently?`)) return;
    setError("");
    try {
      const responses = await Promise.all(
        Array.from(selected).map((id) => fetch(`/api/media/${id}`, { method: "DELETE" }))
      );
      const failed = responses.find((r) => !r.ok);
      if (failed) {
        const payload = await failed.json().catch(() => null);
        const message =
          payload?.error ??
          (failed.status === 401
            ? "Your session expired. Please log in again."
            : "Failed to delete selected files.");
        setError(message);
        if (failed.status === 401) window.location.href = "/admin/login";
        return;
      }
      setSelected(new Set());
      load();
    } catch {
      setError("Network error while deleting selected files.");
    }
  }

  const filtered = items.filter((m) =>
    search ? m.title?.toLowerCase().includes(search.toLowerCase()) : true
  );

  const TABS: { label: string; value: MediaType; icon: React.ElementType }[] = [
    { label: "All",      value: "all",      icon: Image },
    { label: "Images",   value: "image",    icon: Image },
    { label: "Videos",   value: "video",    icon: Film },
    { label: "Documents",value: "document", icon: FileText },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>
            Media Library
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">{items.length} files</p>
        </div>
        <label className="btn-primary cursor-pointer text-sm">
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading…" : "Upload Files"}
          <input type="file" multiple className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)} />
        </label>
      </div>

      {/* Drag-drop zone */}
      <label
        className="block border-2 border-dashed border-stone-200 rounded-xl p-8 text-center mb-6 cursor-pointer hover:border-stone-400 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); e.dataTransfer.files && handleUpload(e.dataTransfer.files); }}>
        <Upload className="w-8 h-8 text-stone-300 mx-auto mb-2" />
        <p className="text-sm text-stone-400">Drag & drop files here, or click to browse</p>
        <p className="text-xs text-stone-300 mt-1">Images, videos, PDFs — up to 20 MB each</p>
        <input type="file" multiple className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)} />
      </label>

      {/* Filters & search */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex border border-stone-200 rounded-lg overflow-hidden bg-white">
          {TABS.map(({ label, value }) => (
            <button key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filter === value
                  ? "text-white"
                  : "text-stone-500 hover:bg-stone-50"
              }`}
              style={filter === value ? { background: "var(--clr-navy)" } : undefined}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-navy" />
        </div>
        {selected.size > 0 && (
          <button onClick={handleDeleteSelected}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-sm font-medium transition-colors">
            <Trash2 className="w-4 h-4" /> Delete {selected.size} selected
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-stone-400 text-sm">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((m) => {
            const isSelected = selected.has(m.id);
            return (
              <div key={m.id}
                className={`relative group rounded-xl overflow-hidden border-2 transition-colors cursor-pointer
                  ${isSelected ? "border-navy" : "border-transparent"}`}
                onClick={() => {
                  const s = new Set(selected);
                  isSelected ? s.delete(m.id) : s.add(m.id);
                  setSelected(s);
                }}>
                {m.type === "image" ? (
                  <img src={m.url} alt={m.title}
                    className="w-full h-24 object-cover bg-stone-100" />
                ) : m.type === "video" ? (
                  <div className="w-full h-24 flex items-center justify-center bg-stone-800">
                    <Film className="w-8 h-8 text-white/40" />
                  </div>
                ) : (
                  <div className="w-full h-24 flex items-center justify-center"
                    style={{ background: "var(--clr-stone)" }}>
                    <FileText className="w-8 h-8 text-stone-300" />
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs text-stone-600 truncate font-medium">{m.title}</p>
                  {m.fileSizeKb && (
                    <p className="text-xs text-stone-300">
                      {m.fileSizeKb > 1024 ? `${(m.fileSizeKb / 1024).toFixed(1)} MB` : `${m.fileSizeKb} KB`}
                    </p>
                  )}
                </div>
                {/* Hover delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3 h-3" />
                </button>
                {isSelected && (
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-navy border-2 border-white flex items-center justify-center"
                    style={{ background: "var(--clr-navy)" }}>
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full text-center py-10 text-stone-400 text-sm">
              No files found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
