// src/app/(public)/about/page.tsx
import { query } from "@/lib/db";
import type { Metadata } from "next";
import { Award, BookOpen, Users, Globe } from "lucide-react";

export const metadata: Metadata = { title: "About Us" };

const CORE_VALUES = [
  { icon: Award,    title: "Academic Excellence",    body: "We strive to create an environment that supports critical analysis, creative exploration, and outstanding academic performance." },
  { icon: BookOpen, title: "Lifelong Learning",       body: "We encourage our students to maintain a deep passion for learning that continues throughout their lives and beyond the classroom." },
  { icon: Users,    title: "Leadership",              body: "We aim to develop leaders who are compassionate, responsible, and ready to create meaningful change." },
  { icon: Globe,    title: "Global Responsibility",  body: "We inspire students to embrace their roles as global citizens, honoring diversity and striving for a more inclusive and equitable world." },
];

export default async function AboutPage() {
  const content = await query<{ key: string; value: string }>(
    `SELECT \`key\`, value FROM site_content WHERE section IN ('about','college_info')`
  );
  const get = (k: string) => content.find((c) => c.key === k)?.value ?? "";

  const staff = await query<{
    id: number; fullName: string; title: string; position: string;
    department: string; photoUrl: string;
  }>(
    `SELECT id, full_name AS fullName, title, position, department,
            photo_url AS photoUrl
     FROM staff WHERE is_published = 1 ORDER BY sort_order LIMIT 12`
  );

  return (
    <div>
      {/* Hero banner */}
      <section className="py-24 text-center"
        style={{ background: "linear-gradient(135deg,var(--clr-navy),#2a4080)" }}>
        <div className="max-w-3xl mx-auto px-4">
          <span className="badge badge-gold text-xs mb-4">Who We Are</span>
          <h1 className="font-playfair text-5xl font-bold text-white mb-4">About TLC</h1>
          <p className="text-white/70 text-lg">
            A premier private institution dedicated to advancing education in Gambella, Ethiopia.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission & Vision */}
        <section className="py-20 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <span className="badge badge-gold text-xs mb-4">Our Mission</span>
            <h2 className="section-heading mb-3">Why We Exist</h2>
            <span className="gold-bar" />
            <p className="text-stone-600 leading-relaxed">{get("mission")}</p>
          </div>
          <div className="rounded-2xl p-8" style={{ background: "var(--clr-stone)" }}>
            <span className="badge badge-navy text-xs mb-4">Our Vision</span>
            <h2 className="font-playfair text-2xl font-bold mb-3"
              style={{ color: "var(--clr-navy)" }}>Where We're Going</h2>
            <p className="text-stone-600 leading-relaxed">{get("vision")}</p>
          </div>
        </section>

        {/* History */}
        <section className="py-16 border-t border-stone-200">
          <span className="badge badge-gold text-xs mb-4">Our Story</span>
          <h2 className="section-heading mb-3">Historical Background</h2>
          <span className="gold-bar" />
          <div className="grid md:grid-cols-2 gap-10 text-stone-600 leading-relaxed text-sm">
            <p>
              Established in Gambella, a city located in western Ethiopia, Trinity Lutheran
              College began as a premier private institution dedicated to addressing the growing
              demand for quality education in the region. Officially established on September 16,
              2017, the college marked a significant milestone by providing exceptional academic
              programs and cultivating a nurturing learning environment.
            </p>
            <p>
              The college occupies a spacious {get("campus_ha")}-hectare campus with state-of-the-art
              classrooms. Trinity invested in importing {get("books")} books from the United States,
              positioning its library as the largest and most diverse in the region. The campus also
              features advanced skills laboratories for nursing, midwifery, and a cutting-edge computer lab.
            </p>
          </div>

          {/* Stats row */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: get("founded"),    label: "Year Established" },
              { value: get("campus_ha") + " ha", label: "Campus Area" },
              { value: get("books"),      label: "Books in Library" },
              { value: "6+",             label: "Degree Programs" },
            ].map(({ value, label }) => (
              <div key={label} className="card p-6 text-center">
                <p className="font-playfair text-3xl font-bold mb-1"
                  style={{ color: "var(--clr-navy)" }}>{value}</p>
                <p className="text-xs text-stone-500 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 border-t border-stone-200">
          <span className="badge badge-gold text-xs mb-4">Our Foundation</span>
          <h2 className="section-heading mb-3">Core Values</h2>
          <span className="gold-bar" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card p-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "var(--clr-stone)" }}>
                  <Icon className="w-5 h-5" style={{ color: "var(--clr-navy)" }} />
                </div>
                <h3 className="font-playfair font-bold mb-2" style={{ color: "var(--clr-navy)" }}>
                  {title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Staff / Faculty */}
        {staff.length > 0 && (
          <section className="py-16 border-t border-stone-200">
            <span className="badge badge-navy text-xs mb-4">Our Team</span>
            <h2 className="section-heading mb-3">Faculty & Staff</h2>
            <span className="gold-bar" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {staff.map((s) => (
                <div key={s.id} className="text-center">
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt={s.fullName}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2"
                      style={{ borderColor: "var(--clr-stone)" }} />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center"
                      style={{ background: "var(--clr-stone)" }}>
                      <Users className="w-7 h-7 text-stone-300" />
                    </div>
                  )}
                  <p className="font-semibold text-sm" style={{ color: "var(--clr-navy)" }}>
                    {s.title ? `${s.title} ` : ""}{s.fullName}
                  </p>
                  <p className="text-xs text-stone-400">{s.position}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
