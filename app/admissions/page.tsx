// src/app/(public)/admissions/page.tsx
import { query } from "@/lib/db";
import type { Metadata } from "next";
import { CheckCircle2, FileText, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { AdmissionRequirement } from "@/types";

export const metadata: Metadata = { title: "Admissions" };

const GROUP_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  general:   { label: "General Requirements",  icon: CheckCircle2, color: "var(--clr-navy)" },
  foreign:   { label: "Foreign Applicants",    icon: Globe,        color: "#0e7490" },
  documents: { label: "Required Documents",    icon: FileText,     color: "var(--clr-gold)" },
};

export default async function AdmissionsPage() {
  const reqs = await query<AdmissionRequirement>(
    `SELECT id, group_name AS groupName, title, description, sort_order AS sortOrder
     FROM admission_requirements WHERE is_active = 1 ORDER BY group_name, sort_order`
  );

  const grouped = Object.entries(GROUP_META).map(([key, meta]) => ({
    key,
    ...meta,
    items: reqs.filter((r) => r.groupName === key),
  }));

  return (
    <div>
      {/* Hero */}
      <section className="py-24 text-center"
        style={{ background: "linear-gradient(135deg,var(--clr-navy),#2a4080)" }}>
        <div className="max-w-3xl mx-auto px-4">
          <span className="badge badge-gold text-xs mb-4">Join Us</span>
          <h1 className="font-playfair text-5xl font-bold text-white mb-4">Admissions</h1>
          <p className="text-white/70 text-lg">
            Begin your academic journey at Trinity Lutheran College.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Steps */}
        <div className="mb-16">
          <span className="badge badge-gold text-xs mb-4">How to Apply</span>
          <h2 className="section-heading mb-3">Application Steps</h2>
          <span className="gold-bar" />
          <ol className="mt-4 space-y-4">
            {[
              "Review admission requirements below",
              "Gather all required documents",
              "Complete the official application form",
              "Submit your application to the Admissions Office",
              "Await your admission letter from the Academic Dean via the student portal",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4 card p-5">
                <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                  style={{ background: "var(--clr-navy)" }}>{i + 1}</span>
                <p className="text-stone-600 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Requirements by group */}
        {grouped.map(({ key, label, icon: Icon, color, items }) =>
          items.length === 0 ? null : (
            <section key={key} className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <Icon className="w-5 h-5" style={{ color }} />
                <h2 className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>
                  {label}
                </h2>
              </div>
              <div className="space-y-4">
                {items.map((r) => (
                  <div key={r.id} className="card p-5 flex gap-4 items-start">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color }} />
                    <div>
                      <p className="font-semibold mb-1" style={{ color: "var(--clr-navy)" }}>
                        {r.title}
                      </p>
                      {r.description && (
                        <p className="text-sm text-stone-500 leading-relaxed">{r.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        )}

        {/* CTA */}
        <div className="rounded-2xl p-10 text-center mt-8"
          style={{ background: "var(--clr-stone)" }}>
          <h3 className="font-playfair text-2xl font-bold mb-3"
            style={{ color: "var(--clr-navy)" }}>Ready to Apply?</h3>
          <p className="text-stone-500 mb-6 text-sm">
            Contact our admissions office for assistance with your application.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact" className="btn-primary">
              Contact Admissions <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/programs" className="btn-outline">Browse Programs</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
