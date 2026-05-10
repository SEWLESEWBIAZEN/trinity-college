"use client";
// src/components/SessionProvider.tsx
// Wraps NextAuth's SessionProvider so it can be used in the server root layout
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
