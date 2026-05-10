// src/app/(public)/student-services/page.tsx
import { query } from "@/lib/db";
import type { Metadata } from "next";
import { BookOpen, FlaskConical, Briefcase, GraduationCap } from "lucide-react";
import type { StudentService } from "@/types";

export const metadata: Metadata = { title: "Student Services" };

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, FlaskConical, Briefcase, GraduationCap,
};

export default async function StudentServicesPage() {
  const services = await query<StudentService>(
    `SELECT id, name, slug, description, icon, image_url AS imageUrl
     FROM student_services WHERE is_active = 1 ORDER BY sort_order`
  );

  return (
    <div>
      <section className="py-24 text-center"
        style={{ background: "linear-gradient(135deg,var(--clr-navy),#2a4080)" }}>
        <div className="max-w-3xl mx-auto px-4">
          <span className="badge badge-gold text-xs mb-4">Campus Life</span>
          <h1 className="font-playfair text-5xl font-bold text-white mb-4">Student Services</h1>
          <p className="text-white/70 text-lg">
            Everything you need to succeed during your time at Trinity Lutheran College.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((s) => {
            const Icon = ICON_MAP[s.icon ?? ""] ?? GraduationCap;
            return (
              <div key={s.id} className="card flex flex-col md:flex-row overflow-hidden">
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={s.name}
                    className="w-full md:w-48 h-48 md:h-auto object-cover" />
                ) : (
                  <div className="w-full md:w-48 h-48 md:h-auto flex items-center justify-center shrink-0"
                    style={{ background: "var(--clr-stone)" }}>
                    <Icon className="w-12 h-12 text-stone-300" />
                  </div>
                )}
                <div className="p-6 flex flex-col justify-center">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: "var(--clr-stone)" }}>
                    <Icon className="w-5 h-5" style={{ color: "var(--clr-navy)" }} />
                  </div>
                  <h2 className="font-playfair text-xl font-bold mb-2"
                    style={{ color: "var(--clr-navy)" }}>{s.name}</h2>
                  <p className="text-stone-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
