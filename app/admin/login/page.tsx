"use client";
// src/app/(admin)/admin/login/page.tsx
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import CollegeLogo from "@/components/branding/CollegeLogo";

type Status = "idle" | "loading" | "success" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin:   "Invalid email or password. Please try again.",
  SessionRequired:     "Your session expired. Please sign in again.",
  AccessDenied:        "Access denied. Your account may be inactive.",
  OAuthSignin:         "Sign-in failed. Please try again.",
  default:             "Something went wrong. Please try again.",
};

export default function AdminLoginPage() {
  const [form,   setForm]   = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const callbackUrl =
        new URLSearchParams(window.location.search).get("callbackUrl") || "/admin";

      const res = await signIn("credentials", {
        redirect: false,
        callbackUrl,
        email:    form.email,
        password: form.password,
      });

      if (res?.ok && !res.error) {
        // ── Success ──────────────────────────────────────────────────────────
        setStatus("success");
        // Brief success flash, then redirect
        setTimeout(() => {
          window.location.href = res.url ?? "/admin";
        }, 900);
      } else {
        // ── Error ────────────────────────────────────────────────────────────
        const code = res?.error ?? "default";
        setStatus("error");
        setError(ERROR_MESSAGES[code] ?? ERROR_MESSAGES.default);
      }
    } catch {
      setStatus("error");
      setError("Network error. Check your connection and try again.");
    }
  }

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg,var(--clr-navy) 60%,#2a4080)" }}
    >
      <div className="w-full max-w-sm">

        {/* ── Logo ── */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CollegeLogo size={64} className="shadow-lg rounded-full" />
          </div>
          <h1 className="font-playfair text-2xl font-bold text-white">Trinity Lutheran</h1>
          <p className="text-white/60 text-sm mt-1">Admin Portal</p>
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* Success banner — slides in at top */}
          {isSuccess && (
            <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 border-b border-emerald-100 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Signed in successfully!</p>
                <p className="text-xs text-emerald-500 mt-0.5">Redirecting to dashboard…</p>
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-6">
              <Lock className="w-4 h-4" style={{ color: "var(--clr-navy)" }} />
              <h2 className="font-playfair font-bold" style={{ color: "var(--clr-navy)" }}>
                Sign In
              </h2>
            </div>

            {/* Error banner */}
            {status === "error" && errorMsg && (
              <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 leading-snug">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  disabled={isLoading || isSuccess}
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (status === "error") setStatus("idle");
                  }}
                  className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors
                    disabled:bg-stone-50 disabled:text-stone-400
                    ${status === "error"
                      ? "border-red-300 focus:border-red-400 bg-red-50"
                      : "border-stone-200 focus:border-navy bg-white"}`}
                  placeholder="admin@trinitylc.edu.et"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    disabled={isLoading || isSuccess}
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      if (status === "error") setStatus("idle");
                    }}
                    className={`w-full border rounded-lg px-3.5 py-2.5 pr-10 text-sm outline-none transition-colors
                      disabled:bg-stone-50 disabled:text-stone-400
                      ${status === "error"
                        ? "border-red-300 focus:border-red-400 bg-red-50"
                        : "border-stone-200 focus:border-navy bg-white"}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    disabled={isLoading || isSuccess}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 disabled:opacity-40"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                  font-semibold text-sm tracking-wide transition-all duration-200
                  disabled:cursor-not-allowed
                  ${isSuccess
                    ? "bg-emerald-500 text-white"
                    : "btn-primary"}`}
              >
                {isLoading && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isSuccess && (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {isLoading ? "Signing in…" :
                 isSuccess ? "Signed in!" :
                 "Sign In"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {new Date().getFullYear()} Trinity Lutheran College · Gambella, Ethiopia
        </p>
      </div>
    </div>
  );
}