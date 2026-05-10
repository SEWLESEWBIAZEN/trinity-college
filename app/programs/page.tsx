// src/app/(public)/programs/page.tsx
import Link from "next/link";
import { query } from "@/lib/db";
import { GraduationCap, Clock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Programs" };

export default async function ProgramsPage() {
  const categories = await query<{
    id: number; name: string; slug: string; description: string;
  }>(`SELECT id, name, slug, description FROM program_categories ORDER BY sort_order`);

  const programs = await query<{
    id: number; name: string; slug: string; degreeType: string;
    durationYears: number; description: string; thumbnailUrl: string;
    categoryId: number;
  }>(`SELECT p.id, p.name, p.slug, p.degree_type AS degreeType,
            p.duration_years AS durationYears, p.description,
            p.thumbnail_url AS thumbnailUrl, p.category_id AS categoryId
     FROM programs p WHERE p.is_published = 1 ORDER BY p.category_id, p.sort_order`);

  const byCategory = categories.map((c) => ({
    ...c,
    programs: programs.filter((p) => p.categoryId === c.id),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-14">
        <span className="badge badge-gold text-xs mb-4">Academics</span>
        <h1 className="section-heading">Academic Programs</h1>
        <span className="gold-bar" />
        <p className="section-subheading -mt-3">
          Explore our diverse range of programs designed to prepare you for a meaningful career.
        </p>
      </div>

      {byCategory.map((cat) =>
        cat.programs.length === 0 ? null : (
          <section key={cat.id} className="mb-16 mx-auto">
            <h2 className="font-playfair text-2xl font-bold mb-1"
              style={{ color: "var(--clr-navy)" }}>{cat.name}</h2>
            {cat.description && (
              <p className="text-stone-500 text-sm mb-6">{cat.description}</p>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.programs.map((p) => (
                <Link href={`/programs/${p.slug}`} key={p.id} className="card group">
                  {p.thumbnailUrl ? (
                    <img src={p.thumbnailUrl} alt={p.name}
                      className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center"
                      style={{ background: "var(--clr-stone)" }}>
                      <GraduationCap className="w-12 h-12 text-stone-300" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="badge badge-navy text-xs capitalize">{p.degreeType}</span>
                    <h3 className="font-playfair text-lg font-bold mt-2 mb-1"
                      style={{ color: "var(--clr-navy)" }}>{p.name}</h3>
                    {p.durationYears && (
                      <p className="flex items-center gap-1 text-xs text-stone-500 mb-3">
                        <Clock className="w-3.5 h-3.5" />
                        {p.durationYears} Year{p.durationYears !== 1 ? "s" : ""}
                      </p>
                    )}
                    {p.description && (
                      <p className="text-sm text-stone-500 line-clamp-2">{p.description}</p>
                    )}
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold"
                      style={{ color: "var(--clr-gold)" }}>
                      View Program <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}
