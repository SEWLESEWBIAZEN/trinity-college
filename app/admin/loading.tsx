// app/admin/loading.tsx
export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-stone-200 animate-spin"
          style={{ borderTopColor: "var(--clr-navy)" }} />
        <p className="text-xs text-stone-400">Loading…</p>
      </div>
    </div>
  );
}
