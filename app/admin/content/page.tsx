"use client";
// src/app/(admin)/admin/content/page.tsx
import { useState, useEffect } from "react";
import { Save, CheckCircle2 } from "lucide-react";

type ContentMap = Record<string, Record<string, string>>;

const SECTIONS = [
  {
    key: "hero",
    label: "Hero Section",
    fields: [
      { key: "title",    label: "Headline",    type: "text" },
      { key: "subtitle", label: "Subtitle",    type: "textarea" },
      { key: "cta_text", label: "CTA Button",  type: "text" },
    ],
  },
  {
    key: "about",
    label: "About — Mission & Vision",
    fields: [
      { key: "mission", label: "Mission Statement", type: "textarea" },
      { key: "vision",  label: "Vision Statement",  type: "textarea" },
    ],
  },
  {
    key: "contact",
    label: "Contact Information",
    fields: [
      { key: "phone1",   label: "Phone 1",  type: "text" },
      { key: "phone2",   label: "Phone 2",  type: "text" },
      { key: "email",    label: "Email",    type: "text" },
      { key: "address",  label: "Address",  type: "textarea" },
    ],
  },
  {
    key: "college_info",
    label: "College Info",
    fields: [
      { key: "founded",   label: "Founded",               type: "text" },
      { key: "campus_ha", label: "Campus Area (hectares)", type: "text" },
      { key: "books",     label: "No. of Library Books",  type: "text" },
    ],
  },
];

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentMap>({});
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((j) => {
        const map: ContentMap = {};
        for (const item of j.data ?? []) {
          if (!map[item.section]) map[item.section] = {};
          map[item.section][item.key] = item.value ?? "";
        }
        setContent(map);
      });
  }, []);

  function handleChange(section: string, key: string, value: string) {
    setContent((prev) => ({
      ...prev,
      [section]: { ...(prev[section] ?? {}), [key]: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    const payload: { section: string; key: string; value: string }[] = [];
    for (const [section, fields] of Object.entries(content)) {
      for (const [key, value] of Object.entries(fields)) {
        payload.push({ section, key, value });
      }
    }
    await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputCls = "w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-navy bg-white transition-colors";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl font-bold" style={{ color: "var(--clr-navy)" }}>
            Site Content
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            Edit text content displayed across the public website.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="btn-primary disabled:opacity-60 text-sm">
          {saved
            ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            : <><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save All Changes"}</>}
        </button>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.key} className="card p-6">
            <h2 className="font-playfair font-bold text-base mb-5 pb-3 border-b border-stone-100"
              style={{ color: "var(--clr-navy)" }}>
              {section.label}
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {section.fields.map((field) => (
                <div key={field.key}
                  className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea rows={4}
                      value={content[section.key]?.[field.key] ?? ""}
                      onChange={(e) => handleChange(section.key, field.key, e.target.value)}
                      className={`${inputCls} resize-none`} />
                  ) : (
                    <input
                      value={content[section.key]?.[field.key] ?? ""}
                      onChange={(e) => handleChange(section.key, field.key, e.target.value)}
                      className={inputCls} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
