// src/app/(public)/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-stone-200 border-t-navy animate-spin"
          style={{ borderTopColor: "var(--clr-navy)" }} />
        <p className="text-sm text-stone-400">Loading…</p>
      </div>
    </div>
  );
}
