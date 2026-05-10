"use client";
// src/app/(public)/contact/page.tsx
import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="py-24 text-center"
        style={{ background: "linear-gradient(135deg,var(--clr-navy),#2a4080)" }}>
        <div className="max-w-3xl mx-auto px-4">
          <span className="badge badge-gold text-xs mb-4">Get In Touch</span>
          <h1 className="font-playfair text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-white/70 text-lg">We'd love to hear from you.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-3 gap-12">
        {/* Info */}
        <div className="space-y-6">
          <h2 className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>
            Reach Us
          </h2>
          {[
            { icon: MapPin, label: "Address",  value: "Kebele 01, Salam Safer, Gambella, Ethiopia" },
            { icon: Phone,  label: "Phone",    value: "0910 004 827\n0901 003 098" },
            { icon: Mail,   label: "Email",    value: "manpign@gmail.com" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "var(--clr-stone)" }}>
                <Icon className="w-5 h-5" style={{ color: "var(--clr-navy)" }} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-stone-400 mb-0.5">{label}</p>
                <p className="text-stone-700 text-sm whitespace-pre-line">{value}</p>
              </div>
            </div>
          ))}

          <div className="rounded-xl overflow-hidden border border-stone-200 h-48">
            <iframe
              title="Trinity Lutheran College Location"
              src="https://maps.google.com/maps?q=Gambella+Ethiopia&output=embed"
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 card p-8 space-y-5">
          <h2 className="font-playfair text-2xl font-bold mb-2" style={{ color: "var(--clr-navy)" }}>
            Send a Message
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Full Name *" required>
              <input required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="field-input" placeholder="Your full name" />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="field-input" placeholder="your@email.com" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Phone">
              <input value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="field-input" placeholder="09XX XXX XXX" />
            </Field>
            <Field label="Subject">
              <input value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="field-input" placeholder="How can we help?" />
            </Field>
          </div>

          <Field label="Message *" required>
            <textarea required rows={5} value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="field-input resize-none" placeholder="Write your message here…" />
          </Field>

          {status === "success" && (
            <p className="text-sm text-emerald-600 font-medium">
              ✓ Message sent! We'll get back to you shortly.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
          )}

          <button type="submit" disabled={status === "loading"}
            className="btn-primary disabled:opacity-60">
            {status === "loading" ? "Sending…" : <><Send className="w-4 h-4" /> Send Message</>}
          </button>
        </form>
      </div>

      <style jsx>{`
        .field-input {
          width: 100%;
          border: 1px solid #e7e3dc;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          outline: none;
          background: white;
          transition: border-color .2s;
        }
        .field-input:focus {
          border-color: var(--clr-navy);
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
