"use client";
// src/components/admin/AdminHeader.tsx
import { signOut } from "next-auth/react";
import { LogOut, Bell } from "lucide-react";

export default function AdminHeader({ user }: { user: { name: string; email: string } }) {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-stone-200 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors">
          <Bell className="w-4 h-4 text-stone-500" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "var(--clr-navy)" }}>
            {user.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold leading-none">{user.name}</p>
            <p className="text-xs text-stone-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 text-stone-400 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
