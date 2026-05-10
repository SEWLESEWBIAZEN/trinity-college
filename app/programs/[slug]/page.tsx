// src/app/(public)/programs/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { query } from "@/lib/db";
import { Clock, GraduationCap, FileText, ArrowLeft, Download } from "lucide-react";
import type { Metadata } from "next";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rows = await query<{ name: string }>(
    "SELECT name FROM programs WHERE slug = ? AND is_published = 1", [params.slug]
  );
  return { title: rows[0]?.name ?? "Program" };
}

export default async function ProgramDetailPage({ params }: Props) {
  const rows = await query<{
    id: number; name: string; degreeType: string; durationYears: number;
    description: string; objectives: string; careerOutcomes: string;
    admissionReq: string; thumbnailUrl: string; categoryName: string;
  }>(
    `SELECT p.id, p.name, p.degree_type AS degreeType, p.duration_years AS durationYears,
            p.description, p.objectives, p.career_outcomes AS careerOutcomes,
            p.admission_req AS admissionReq, p.thumbnail_url AS thumbnailUrl,
            pc.name AS categoryName
     FROM programs p LEFT JOIN program_categories pc ON p.category_id = pc.id
     WHERE p.slug = ? AND p.is_published = 1`,
    [params.slug]
  );

  if (!rows[0]) notFound();
  const p = rows[0];

  const docs = await query<{ id: number; title: string; fileUrl: string; fileType: string }>(
    `SELECT id, title, file_url AS fileUrl, file_type AS fileType
     FROM program_documents WHERE program_id = ? ORDER BY sort_order`,
    [p.id]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Link href="/programs" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Programs
      </Link>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main */}
        <div className="lg:col-span-2">
          {p.thumbnailUrl && (
            <img src={p.thumbnailUrl} alt={p.name}
              className="w-full h-60 object-cover rounded-xl mb-8" />
          )}
          <span className="badge badge-gold text-xs capitalize mb-3">{p.categoryName}</span>
          <h1 className="font-playfair text-4xl font-bold mb-2"
            style={{ color: "var(--clr-navy)" }}>{p.name}</h1>
          <div className="flex items-center gap-4 text-sm text-stone-500 mb-6">
            <span className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4" />
              <span className="capitalize">{p.degreeType}</span>
            </span>
            {p.durationYears && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {p.durationYears} Years
              </span>
            )}
          </div>

          {p.description && (
            <Section title="Program Overview">{p.description}</Section>
          )}
          {p.objectives && (
            <Section title="Learning Objectives">{p.objectives}</Section>
          )}
          {p.careerOutcomes && (
            <Section title="Career Outcomes">{p.careerOutcomes}</Section>
          )}
          {p.admissionReq && (
            <Section title="Admission Requirements">{p.admissionReq}</Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply card */}
          <div className="card p-6 text-center"
            style={{ background: "var(--clr-navy)" }}>
            <GraduationCap className="w-10 h-10 mx-auto mb-3 text-white/60" />
            <h3 className="font-playfair font-bold text-white text-lg mb-2">
              Ready to Apply?
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Join our community of future leaders.
            </p>
            <Link href="/admissions" className="btn-gold w-full justify-center">
              Apply Now
            </Link>
          </div>

          {/* Documents */}
          {docs.length > 0 && (
            <div className="card p-5">
              <h3 className="font-playfair font-bold mb-4"
                style={{ color: "var(--clr-navy)" }}>
                <FileText className="w-4 h-4 inline mr-2" />
                Course Documents
              </h3>
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li key={d.id}>
                    <a href={d.fileUrl} download
                      className="flex items-center gap-2 text-sm text-stone-600 hover:text-navy transition-colors">
                      <Download className="w-4 h-4 shrink-0" style={{ color: "var(--clr-gold)" }} />
                      {d.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div className="card p-5 text-sm" style={{ background: "var(--clr-stone)" }}>
            <p className="font-semibold mb-1" style={{ color: "var(--clr-navy)" }}>
              Have Questions?
            </p>
            <p className="text-stone-500 mb-3">We're here to help with your program inquiry.</p>
            <Link href="/contact" className="btn-outline text-xs px-4 py-2">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <div className="mb-8">
      <h2 className="font-playfair text-xl font-bold mb-2" style={{ color: "var(--clr-navy)" }}>
        {title}
      </h2>
      <div className="w-8 h-0.5 mb-4" style={{ background: "var(--clr-gold)" }} />
      <p className="text-stone-600 leading-relaxed text-sm">{children}</p>
    </div>
  );
}
