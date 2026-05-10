// src/app/not-found.tsx
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "linear-gradient(135deg,var(--clr-navy) 60%,#2a4080)" }}
    >
      <GraduationCap className="w-16 h-16 text-white/20 mb-6" />
      <h1 className="font-playfair text-8xl font-bold text-white mb-4">404</h1>
      <h2 className="font-playfair text-2xl font-bold text-white mb-3">
        Page Not Found
      </h2>
      <p className="text-white/60 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="btn-gold"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
