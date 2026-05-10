"use client";
// src/app/error.tsx
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--clr-stone)" }}
    >
      <h1
        className="font-playfair text-5xl font-bold mb-4"
        style={{ color: "var(--clr-navy)" }}
      >
        Something went wrong
      </h1>
      <p className="text-stone-500 mb-8 max-w-sm">
        An unexpected error occurred. Please try again or go back home.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">
          Try Again
        </button>
        <Link href="/" className="btn-outline">
          Go Home
        </Link>
      </div>
    </div>
  );
}
