// src/app/(admin)/admin/page.tsx
import { query } from "@/lib/db";
import { GraduationCap, Image, Users, MessageSquare, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const [[{ programs }], [{ media }], [{ staff }], [{ messages }], [{ announcements }], recent] =
    await Promise.all([
      query<{ programs: number }>("SELECT COUNT(*) AS programs FROM programs"),
      query<{ media: number }>("SELECT COUNT(*) AS media FROM media"),
      query<{ staff: number }>("SELECT COUNT(*) AS staff FROM staff"),
      query<{ messages: number }>("SELECT COUNT(*) AS messages FROM contact_messages WHERE is_read = 0"),
      query<{ announcements: number }>("SELECT COUNT(*) AS announcements FROM announcements"),
      query<{ name: string; email: string; subject: string; created_at: string }>(
        "SELECT name, email, subject, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 5"
      ),
    ]);

  const STATS = [
    { label: "Programs",         value: programs,     icon: GraduationCap, href: "/admin/programs",      color: "var(--clr-navy)" },
    { label: "Media Files",      value: media,        icon: Image,         href: "/admin/media",          color: "#0e7490" },
    { label: "Staff Members",    value: staff,        icon: Users,         href: "/admin/staff",          color: "#7c3aed" },
    { label: "Unread Messages",  value: messages,     icon: MessageSquare, href: "/admin/messages",       color: "#dc2626" },
    { label: "Announcements",    value: announcements,icon: FileText,      href: "/admin/announcements",  color: "var(--clr-gold)" },
  ];

  return (
    <div>
      <div
        className="mb-8 rounded-2xl border border-stone-200 px-6 py-5"
        style={{
          background:
            "linear-gradient(120deg, rgba(26,39,68,0.06) 0%, rgba(201,153,58,0.09) 100%)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
          Admin Overview
        </p>
        <h1 className="font-playfair text-3xl font-bold" style={{ color: "var(--clr-navy)" }}>
          Dashboard
        </h1>
        <p className="text-stone-600 text-sm mt-1.5">
          Welcome back. Monitor key activity and take quick action from one place.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {STATS.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={label} href={href}
            className="card p-5 group flex flex-col gap-3 border border-stone-100">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <TrendingUp className="w-4 h-4 text-stone-300 group-hover:text-stone-400 transition-colors" />
            </div>
            <div>
              <p className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>
                {value}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6 border border-stone-100">
          <h2 className="font-playfair font-bold mb-4" style={{ color: "var(--clr-navy)" }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/admin/programs/new",      label: "Add Program" },
              { href: "/admin/media",             label: "Upload Media" },
              { href: "/admin/staff/new",         label: "Add Staff" },
              { href: "/admin/announcements/new", label: "Post Announcement" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="border border-stone-200 rounded-lg px-4 py-3 text-sm font-medium text-center hover:border-navy hover:bg-stone-50 transition-colors"
                style={{ color: "var(--clr-navy)" }}>
                + {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent messages */}
        <div className="card p-6 border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-playfair font-bold" style={{ color: "var(--clr-navy)" }}>
              Recent Messages
            </h2>
            <Link href="/admin/messages"
              className="text-xs font-medium" style={{ color: "var(--clr-gold)" }}>
              View All →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-stone-400">No messages yet.</p>
          ) : (
            <ul className="space-y-3">
              {recent.map((m, i) => (
                <li key={i} className="flex items-start gap-3 pb-3 border-b border-stone-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: "var(--clr-navy)" }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                    <p className="text-xs text-stone-400 truncate">{m.subject ?? m.email ?? "—"}</p>
                  </div>
                  <span className="text-xs text-stone-300 shrink-0">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
