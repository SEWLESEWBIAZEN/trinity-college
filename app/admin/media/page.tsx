"use client";
// src/app/(admin)/admin/media/page.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Upload, Trash2, Image, FileText, Film, Search, X, CheckCircle2, AlertCircle } from "lucide-react";

type MediaType = "all" | "image" | "video" | "document";

interface MediaItem {
  id: number; title: string; type: string; url: string;
  thumbnailUrl?: string; mimeType?: string; fileSizeKb?: number; createdAt: string;
}

interface UploadProgress {
  name: string;
  progress: number;           // 0–100
  status: "uploading" | "done" | "error";
  error?: string;
}

interface OverlayState {
  show: boolean;
  type: "upload" | "delete" | null;
  message: string;
  files: UploadProgress[];    // only used during upload
  done: boolean;
  error: string;
}

const BLANK_OVERLAY: OverlayState = {
  show: false, type: null, message: "", files: [], done: false, error: "",
};

// ─── Full-page overlay ────────────────────────────────────────────────────────
function PageOverlay({ state, onClose }: { state: OverlayState; onClose: () => void }) {
  if (!state.show) return null;

  const total     = state.files.length;
  const doneCount = state.files.filter((f) => f.status === "done").length;
  const errCount  = state.files.filter((f) => f.status === "error").length;
  const overall   = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(26,39,68,0.75)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-playfair font-bold text-lg" style={{ color: "var(--clr-navy)" }}>
            {state.type === "upload" ? "Uploading Files" : "Deleting Files"}
          </h2>
          {state.done && (
            <button onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Delete spinner / done */}
          {state.type === "delete" && (
            <div className="flex flex-col items-center py-4 gap-4">
              {!state.done && !state.error && (
                <>
                  <div className="w-14 h-14 rounded-full border-4 border-stone-200 animate-spin"
                    style={{ borderTopColor: "var(--clr-navy)" }} />
                  <p className="text-sm text-stone-500">{state.message}</p>
                </>
              )}
              {state.done && !state.error && (
                <>
                  <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                  <p className="text-sm font-medium text-emerald-600">Deleted successfully</p>
                </>
              )}
              {state.error && (
                <>
                  <AlertCircle className="w-14 h-14 text-red-500" />
                  <p className="text-sm text-red-600">{state.error}</p>
                </>
              )}
            </div>
          )}

          {/* Upload progress */}
          {state.type === "upload" && (
            <>
              {/* Overall bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                  <span>{state.message}</span>
                  <span>{doneCount} / {total} files</span>
                </div>
                <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${overall}%`,
                      background: state.done && errCount === 0
                        ? "#10b981"
                        : "var(--clr-navy)",
                    }}
                  />
                </div>
              </div>

              {/* Per-file list */}
              <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {state.files.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {/* Status icon */}
                    <div className="shrink-0">
                      {f.status === "done" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {f.status === "error" && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {f.status === "uploading" && (
                        <div className="w-4 h-4 rounded-full border-2 border-stone-200 animate-spin"
                          style={{ borderTopColor: "var(--clr-navy)" }} />
                      )}
                    </div>

                    {/* Name + mini bar */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-700 truncate">{f.name}</p>
                      {f.status === "uploading" && (
                        <div className="mt-1 h-1 rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-200"
                            style={{ width: `${f.progress}%`, background: "var(--clr-navy)" }}
                          />
                        </div>
                      )}
                      {f.status === "error" && (
                        <p className="text-xs text-red-500 mt-0.5">{f.error}</p>
                      )}
                    </div>

                    {/* Percent */}
                    <span className="text-xs text-stone-400 shrink-0 w-8 text-right">
                      {f.status === "done" ? "100%" :
                       f.status === "error" ? "—" :
                       `${f.progress}%`}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Summary when done */}
              {state.done && (
                <div className={`rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2
                  ${errCount === 0
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                  {errCount === 0
                    ? <><CheckCircle2 className="w-4 h-4" /> All {total} file{total !== 1 ? "s" : ""} uploaded successfully</>
                    : <><AlertCircle  className="w-4 h-4" /> {doneCount} uploaded, {errCount} failed</>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer — only when done */}
        {state.done && (
          <div className="px-6 pb-5">
            <button onClick={onClose} className="btn-primary w-full justify-center">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminMediaPage() {
  const [items,    setItems]    = useState<MediaItem[]>([]);
  const [filter,   setFilter]   = useState<MediaType>("all");
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [overlay,  setOverlay]  = useState<OverlayState>(BLANK_OVERLAY);
  const overlayRef = useRef<OverlayState>(BLANK_OVERLAY);

  // Keep ref in sync so async callbacks always see latest state
  function patchOverlay(patch: Partial<OverlayState>) {
    const next = { ...overlayRef.current, ...patch };
    overlayRef.current = next;
    setOverlay({ ...next });
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q   = filter !== "all" ? `&type=${filter}` : "";
      const res = await fetch(`/api/media?limit=100${q}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? `HTTP ${res.status}`);
      setItems(json?.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // ── Upload ────────────────────────────────────────────────────────────────
  async function handleUpload(files: FileList) {
    const fileArr = Array.from(files);
    if (!fileArr.length) return;

    // Initialise overlay
    const initial: UploadProgress[] = fileArr.map((f) => ({
      name: f.name, progress: 0, status: "uploading",
    }));
    const initState: OverlayState = {
      show: true, type: "upload",
      message: `Uploading ${fileArr.length} file${fileArr.length !== 1 ? "s" : ""}…`,
      files: initial, done: false, error: "",
    };
    overlayRef.current = initState;
    setOverlay({ ...initState });

    // Upload sequentially so per-file progress is meaningful
    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];

      // Simulate progress ticks while the real fetch is running
      const ticker = setInterval(() => {
        const cur = overlayRef.current.files[i]?.progress ?? 0;
        if (cur < 85) {
          const updated = [...overlayRef.current.files];
          updated[i] = { ...updated[i], progress: cur + 5 };
          patchOverlay({ files: updated });
        }
      }, 120);

      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", file.name);
        const res = await fetch("/api/media", { method: "POST", body: fd });

        clearInterval(ticker);

        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          const msg = payload?.error ?? (res.status === 401
            ? "Session expired — please log in again."
            : `Upload failed (HTTP ${res.status}).`);
          const updated = [...overlayRef.current.files];
          updated[i] = { ...updated[i], progress: 0, status: "error", error: msg };
          patchOverlay({ files: updated });
          if (res.status === 401) { window.location.href = "/admin/login"; return; }
        } else {
          const updated = [...overlayRef.current.files];
          updated[i] = { ...updated[i], progress: 100, status: "done" };
          patchOverlay({
            files: updated,
            message: `Uploaded ${i + 1} of ${fileArr.length}…`,
          });
        }
      } catch {
        clearInterval(ticker);
        const updated = [...overlayRef.current.files];
        updated[i] = { ...updated[i], progress: 0, status: "error", error: "Network error" };
        patchOverlay({ files: updated });
      }
    }

    patchOverlay({ done: true, message: "Upload complete" });
    load();
  }

  // ── Delete single ─────────────────────────────────────────────────────────
  async function handleDelete(id: number) {
    if (!confirm("Delete this file permanently?")) return;

    patchOverlay({
      show: true, type: "delete",
      message: "Deleting file…",
      files: [], done: false, error: "",
    });

    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const msg = payload?.error ?? `Delete failed (HTTP ${res.status}).`;
        patchOverlay({ done: true, error: msg });
        if (res.status === 401) window.location.href = "/admin/login";
        return;
      }
      patchOverlay({ done: true });
      load();
    } catch {
      patchOverlay({ done: true, error: "Network error while deleting." });
    }
  }

  // ── Delete selected ───────────────────────────────────────────────────────
  async function handleDeleteSelected() {
    const ids = Array.from(selected);
    if (!confirm(`Delete ${ids.length} file${ids.length !== 1 ? "s" : ""} permanently?`)) return;

    patchOverlay({
      show: true, type: "delete",
      message: `Deleting ${ids.length} file${ids.length !== 1 ? "s" : ""}…`,
      files: [], done: false, error: "",
    });

    try {
      const results = await Promise.all(
        ids.map((id) => fetch(`/api/media/${id}`, { method: "DELETE" }))
      );
      const failed = results.find((r) => !r.ok);
      if (failed) {
        const payload = await failed.json().catch(() => null);
        const msg = payload?.error ?? `Delete failed (HTTP ${failed.status}).`;
        patchOverlay({ done: true, error: msg });
        if (failed.status === 401) window.location.href = "/admin/login";
        return;
      }
      setSelected(new Set());
      patchOverlay({ done: true });
      load();
    } catch {
      patchOverlay({ done: true, error: "Network error while deleting." });
    }
  }

  // ── Filter + search ───────────────────────────────────────────────────────
  const filtered = items.filter((m) =>
    search ? m.title?.toLowerCase().includes(search.toLowerCase()) : true
  );

  const TABS: { label: string; value: MediaType }[] = [
    { label: "All",       value: "all"      },
    { label: "Images",    value: "image"    },
    { label: "Videos",    value: "video"    },
    { label: "Documents", value: "document" },
  ];

  return (
    <>
      {/* Full-page overlay */}
      <PageOverlay state={overlay} onClose={() => setOverlay(BLANK_OVERLAY)} />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>
              Media Library
            </h1>
            <p className="text-stone-500 text-sm mt-0.5">{items.length} files</p>
          </div>
          <label className="btn-primary cursor-pointer text-sm">
            <Upload className="w-4 h-4" />
            Upload Files
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

        {/* Filters + search + bulk delete */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex border border-stone-200 rounded-lg overflow-hidden bg-white">
            {TABS.map(({ label, value }) => (
              <button key={value} onClick={() => setFilter(value)}
                className={`px-4 py-2 text-sm font-medium transition-colors
                  ${filter === value ? "text-white" : "text-stone-500 hover:bg-stone-50"}`}
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
          <div className="flex items-center gap-3 py-16 justify-center text-stone-400">
            <div className="w-6 h-6 rounded-full border-2 border-stone-200 animate-spin"
              style={{ borderTopColor: "var(--clr-navy)" }} />
            <span className="text-sm">Loading media…</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map((m) => {
              const isSelected = selected.has(m.id);
              return (
                <div key={m.id}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-colors cursor-pointer
                    ${isSelected ? "" : "border-transparent"}`}
                  style={isSelected ? { borderColor: "var(--clr-navy)" } : undefined}
                  onClick={() => {
                    const s = new Set(selected);
                    isSelected ? s.delete(m.id) : s.add(m.id);
                    setSelected(s);
                  }}>

                  {/* Thumbnail */}
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

                  {/* Caption */}
                  <div className="p-2">
                    <p className="text-xs text-stone-600 truncate font-medium">{m.title}</p>
                    {m.fileSizeKb && (
                      <p className="text-xs text-stone-300">
                        {m.fileSizeKb > 1024
                          ? `${(m.fileSizeKb / 1024).toFixed(1)} MB`
                          : `${m.fileSizeKb} KB`}
                      </p>
                    )}
                  </div>

                  {/* Hover delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                      style={{ background: "var(--clr-navy)" }}>
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <p className="col-span-full text-center py-16 text-stone-400 text-sm">
                No files found.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}