"use client";
// src/app/(admin)/admin/login/page.tsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock } from "lucide-react";
import CollegeLogo from "@/components/branding/CollegeLogo";

export default function AdminLoginPage() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/admin";
    const res = await signIn("credentials", {
      redirect: true,
      callbackUrl,
      email: form.email,
      password: form.password,
    });
    if (res?.error) {
      setLoading(false);
      setError("Invalid email or password.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg,var(--clr-navy) 60%,#2a4080)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-white">
            <CollegeLogo size={58} className="rounded-2xl" />
          </div>
          <h1 className="font-playfair text-2xl font-bold text-white">Trinity Lutheran</h1>
          <p className="text-white/60 text-sm mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4" style={{ color: "var(--clr-navy)" }} />
            <h2 className="font-playfair font-bold" style={{ color: "var(--clr-navy)" }}>
              Sign In
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
                Email
              </label>
              <input
                type="email" required autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-navy transition-colors"
                placeholder="admin@trinitylc.edu.et"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} required autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-navy transition-colors pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center mt-2 disabled:opacity-60">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} Trinity Lutheran College
        </p>
      </div>
    </div>
  );
}
