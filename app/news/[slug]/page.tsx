// src/app/(public)/news/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { query } from "@/lib/db";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import type { Metadata } from "next";
import type { Announcement } from "@/types";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rows = await query<{ title: string; excerpt: string }>(
    "SELECT title, excerpt FROM announcements WHERE slug = ? AND is_published = 1",
    [params.slug]
  );
  return {
    title: rows[0]?.title ?? "Announcement",
    description: rows[0]?.excerpt,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const rows = await query<Announcement & { authorName: string }>(
    `SELECT a.id, a.title, a.slug, a.excerpt, a.body, a.cover_url AS coverUrl,
            a.category, a.event_date AS eventDate, a.published_at AS publishedAt,
            u.name AS authorName
     FROM announcements a
     LEFT JOIN users u ON a.author_id = u.id
     WHERE a.slug = ? AND a.is_published = 1`,
    [params.slug]
  );

  if (!rows[0]) notFound();
  const a = rows[0];

  /* Related — same category, exclude self */
  const related = await query<Announcement>(
    `SELECT id, title, slug, cover_url AS coverUrl, category, published_at AS publishedAt
     FROM announcements
     WHERE is_published = 1 AND category = ? AND slug != ?
     ORDER BY published_at DESC LIMIT 3`,
    [a.category, a.slug]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/news"
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to News & Events
      </Link>

      {/* Cover */}
      {a.coverUrl && (
        <img src={a.coverUrl} alt={a.title}
          className="w-full h-72 object-cover rounded-2xl mb-8" />
      )}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className={`badge text-xs capitalize
          ${a.category === "event" ? "badge-gold" :
            a.category === "scholarship" ? "badge-green" : "badge-navy"}`}>
          <Tag className="w-3 h-3 mr-1" />{a.category}
        </span>
        {a.publishedAt && (
          <span className="flex items-center gap-1 text-xs text-stone-400">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(a.publishedAt).toLocaleDateString("en-ET", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </span>
        )}
        {a.authorName && (
          <span className="flex items-center gap-1 text-xs text-stone-400">
            <User className="w-3.5 h-3.5" /> {a.authorName}
          </span>
        )}
      </div>

      <h1 className="font-playfair text-4xl font-bold mb-6 leading-tight"
        style={{ color: "var(--clr-navy)" }}>
        {a.title}
      </h1>

      {a.excerpt && (
        <p className="text-lg text-stone-500 leading-relaxed mb-6 border-l-4 pl-5"
          style={{ borderColor: "var(--clr-gold)" }}>
          {a.excerpt}
        </p>
      )}

      {a.body && (
        <div className="prose-content text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">
          {a.body}
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16 pt-10 border-t border-stone-200">
          <h2 className="font-playfair text-xl font-bold mb-5"
            style={{ color: "var(--clr-navy)" }}>Related Announcements</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {related.map((r) => (
              <Link key={r.id} href={`/news/${r.slug}`} className="card group block">
                {r.coverUrl ? (
                  <img src={r.coverUrl} alt={r.title}
                    className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36" style={{ background: "var(--clr-stone)" }} />
                )}
                <div className="p-4">
                  <h3 className="font-playfair font-bold text-sm leading-snug group-hover:underline"
                    style={{ color: "var(--clr-navy)" }}>
                    {r.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
