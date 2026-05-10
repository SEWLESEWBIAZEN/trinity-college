// src/types/next-auth.d.ts
import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "super_admin" | "admin" | "editor";
      avatarUrl?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "super_admin" | "admin" | "editor";
    avatarUrl?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: "super_admin" | "admin" | "editor";
    avatarUrl?: string;
  }
}
