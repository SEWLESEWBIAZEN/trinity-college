// src/app/(public)/news/page.tsx
import { query } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, Tag } from "lucide-react";
import type { Announcement } from "@/types";

export const metadata: Metadata = { title: "News & Events" };

const CAT_COLOR: Record<string, string> = {
  news:        "badge-navy",
  event:       "badge-gold",
  notice:      "badge-yellow",
  scholarship: "badge-green",
};

export default async function NewsPage() {
  const items = await query<Announcement>(
    `SELECT id, title, slug, excerpt, cover_url AS coverUrl,
            category, event_date AS eventDate,
            is_pinned AS isPinned, published_at AS publishedAt
     FROM announcements
     WHERE is_published = 1
     ORDER BY is_pinned DESC, published_at DESC`
  );

  const pinned  = items.filter((a) => a.isPinned);
  const regular = items.filter((a) => !a.isPinned);

  return (
    <div>
      {/* Hero */}
      <section className="py-24 text-center"
        style={{ background: "linear-gradient(135deg,var(--clr-navy),#2a4080)" }}>
        <div className="max-w-3xl mx-auto px-4">
          <span className="badge badge-gold text-xs mb-4">Updates</span>
          <h1 className="font-playfair text-5xl font-bold text-white mb-4">News & Events</h1>
          <p className="text-white/70 text-lg">
            Stay up to date with what's happening at Trinity Lutheran College.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Pinned */}
        {pinned.length > 0 && (
          <section className="mb-14">
            <h2 className="font-playfair text-xl font-bold mb-5" style={{ color: "var(--clr-navy)" }}>
              📌 Pinned
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pinned.map((a) => <AnnouncementCard key={a.id} a={a} />)}
            </div>
          </section>
        )}

        {/* All */}
        <section>
          <h2 className="font-playfair text-xl font-bold mb-5" style={{ color: "var(--clr-navy)" }}>
            All Announcements
          </h2>
          {regular.length === 0 && pinned.length === 0 ? (
            <p className="text-stone-400 text-sm py-10 text-center">No announcements yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regular.map((a) => <AnnouncementCard key={a.id} a={a} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function AnnouncementCard({ a }: { a: Announcement }) {
  return (
    <Link href={`/news/${a.slug}`} className="card group block">
      {a.coverUrl ? (
        <img src={a.coverUrl} alt={a.title}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-44 flex items-center justify-center"
          style={{ background: "var(--clr-stone)" }}>
          <Tag className="w-8 h-8 text-stone-300" />
        </div>
      )}
      <div className="p-5">
        <span className={`badge text-xs capitalize mb-2 ${CAT_COLOR[a.category] ?? "badge-navy"}`}>
          {a.category}
        </span>
        <h3 className="font-playfair font-bold leading-snug mt-1 group-hover:underline"
          style={{ color: "var(--clr-navy)" }}>
          {a.title}
        </h3>
        {a.excerpt && (
          <p className="text-sm text-stone-500 mt-2 line-clamp-2 leading-relaxed">{a.excerpt}</p>
        )}
        {(a.eventDate ?? a.publishedAt) && (
          <p className="flex items-center gap-1.5 text-xs text-stone-400 mt-3">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(a.eventDate ?? a.publishedAt!).toLocaleDateString("en-ET", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        )}
      </div>
    </Link>
  );
}
