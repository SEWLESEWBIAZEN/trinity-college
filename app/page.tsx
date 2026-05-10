// src/app/(public)/page.tsx
import Link from "next/link";
import { query } from "@/lib/db";
import {
  BookOpen, FlaskConical, Briefcase, GraduationCap, ArrowRight,
} from "lucide-react";
import type { Program, Announcement, StudentService } from "@/types";
import HeroCarousel from "@/components/home/HeroCarousel";

/* ── Icon map for services ─── */
const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, FlaskConical, Briefcase, GraduationCap,
};

export default async function HomePage() {
  const programs = await query<Program>(
    `SELECT p.id, p.name, p.slug, p.degree_type AS degreeType,
            p.duration_years AS durationYears, p.thumbnail_url AS thumbnailUrl,
            pc.name AS categoryName
     FROM programs p LEFT JOIN program_categories pc ON p.category_id = pc.id
     WHERE p.is_published = 1 ORDER BY p.sort_order LIMIT 6`
  );

  const services = await query<StudentService>(
    `SELECT id, name, slug, description, icon, image_url AS imageUrl
     FROM student_services WHERE is_active = 1 ORDER BY sort_order`
  );

  const news = await query<Announcement>(
    `SELECT id, title, slug, excerpt, cover_url AS coverUrl,
            category, published_at AS publishedAt
     FROM announcements WHERE is_published = 1
     ORDER BY is_pinned DESC, published_at DESC LIMIT 3`
  );

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <HeroCarousel />

      {/* ── Programs ──────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-up">
          <span className="badge badge-gold text-xs mb-4">Academic Offerings</span>
          <h2 className="section-heading">Our Programs</h2>
          <span className="gold-bar" />
          <p className="section-subheading -mt-3">
            From health sciences to business and social work, we offer rigorous programs
            designed for the modern workforce.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((p) => (
            <Link href={`/programs/${p.slug}`} key={p.id} className="card group">
              {p.thumbnailUrl ? (
                <img src={p.thumbnailUrl} alt={p.name}
                  className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 flex items-center justify-center"
                  style={{ background: "var(--clr-stone)" }}>
                  <GraduationCap className="w-12 h-12 text-stone-300" />
                </div>
              )}
              <div className="p-5">
                <span className="badge badge-navy text-xs capitalize mb-2">
                  {p.degreeType}
                </span>
                <h3 className="font-playfair text-lg font-bold mt-1 group-hover:text-navy transition-colors"
                  style={{ color: "var(--clr-navy)" }}>{p.name}</h3>
                {p.durationYears && (
                  <p className="text-xs text-stone-500 mt-1">{p.durationYears} Year{p.durationYears !== 1 ? "s" : ""}</p>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold"
                  style={{ color: "var(--clr-gold)" }}>
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/programs" className="btn-outline">View All Programs</Link>
        </div>
      </section>

      {/* ── Why TLC ───────────────────────────────────────────── */}
      <section className="py-20" style={{ background: "var(--clr-stone)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="badge badge-navy text-xs mb-4">Why Choose Us</span>
          <h2 className="section-heading">A Campus Built for Excellence</h2>
          <span className="gold-bar" />

          <div className="mt-8 grid md:grid-cols-3 gap-8 text-sm leading-relaxed text-stone-600">
            {[
              { title: "Region's Largest Library", body: "15,219 books imported from the United States — the most extensive academic collection in Gambella." },
              { title: "Modern Skill Labs",         body: "State-of-the-art nursing and midwifery laboratories with professional-grade equipment for hands-on training." },
              { title: "Experienced Faculty",       body: "Highly qualified lecturers dedicated to student success across all disciplines and programs." },
            ].map(({ title, body }) => (
              <div key={title} className="card p-7">
                <span className="gold-bar mb-4" />
                <h3 className="font-playfair text-xl font-bold mb-2"
                  style={{ color: "var(--clr-navy)" }}>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Student Services ──────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <span className="badge badge-gold text-xs mb-4">Campus Life</span>
        <h2 className="section-heading">Student Services</h2>
        <span className="gold-bar" />

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => {
            const Icon = ICON_MAP[s.icon ?? ""] ?? GraduationCap;
            return (
              <div key={s.id} className="card p-6 text-center group">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 transition-colors"
                  style={{ background: "var(--clr-stone)" }}>
                  <Icon className="w-6 h-6" style={{ color: "var(--clr-navy)" }} />
                </div>
                <h3 className="font-playfair font-bold mb-2"
                  style={{ color: "var(--clr-navy)" }}>{s.name}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── News ──────────────────────────────────────────────── */}
      {news.length > 0 && (
        <section className="py-20" style={{ background: "var(--clr-stone)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="badge badge-navy text-xs mb-4">Latest Updates</span>
            <h2 className="section-heading">News & Events</h2>
            <span className="gold-bar" />

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {news.map((a) => (
                <Link href={`/news/${a.slug}`} key={a.id} className="card group">
                  {a.coverUrl && (
                    <img src={a.coverUrl} alt={a.title}
                      className="w-full h-44 object-cover" />
                  )}
                  <div className="p-5">
                    <span className={`badge text-xs capitalize mb-2
                      ${a.category === "event" ? "badge-gold" :
                        a.category === "scholarship" ? "badge-green" : "badge-navy"}`}>
                      {a.category}
                    </span>
                    <h3 className="font-playfair font-bold mt-1 leading-snug group-hover:underline"
                      style={{ color: "var(--clr-navy)" }}>{a.title}</h3>
                    {a.excerpt && (
                      <p className="text-sm text-stone-500 mt-2 line-clamp-2">{a.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="py-24 text-center"
        style={{ background: "linear-gradient(135deg,var(--clr-navy),#2a4080)" }}>
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-white mb-4">
            Begin Your Journey at Trinity
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Join a community of ambitious learners in the heart of Gambella.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/admissions" className="btn-gold">Apply Now</Link>
            <Link href="/contact" className="btn-outline"
              style={{ borderColor: "rgba(255,255,255,.4)", color: "#fff" }}>
              Request Info
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
