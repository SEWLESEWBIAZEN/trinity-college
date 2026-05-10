// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "./db";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "editor";
  avatarUrl?: string;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8 hours
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const rows = await query<{
          id: number;
          name: string;
          email: string;
          password_hash: string;
          role: string;
          avatar_url: string | null;
          is_active: boolean;
        }>(
          "SELECT id, name, email, password_hash, role, avatar_url, is_active FROM users WHERE email = ?",
          [credentials.email]
        );

        const user = rows[0];
        if (!user || !user.is_active) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatar_url ?? undefined,
        } as AdminUser & { id: string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AdminUser & { id: string };
        token.role = u.role;
        token.avatarUrl = u.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as AdminUser).role = token.role as AdminUser["role"];
        (session.user as AdminUser).avatarUrl = token.avatarUrl as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
