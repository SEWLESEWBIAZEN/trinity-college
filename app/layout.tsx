// src/app/layout.tsx
import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import SiteChrome from "@/components/layout/SiteChrome";
import { NavigationProgressProvider } from "@/components/navigation/NavigationProgressProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Trinity Lutheran College — Gambella, Ethiopia",
    template: "%s | Trinity Lutheran College",
  },
  description:
    "Advancing academic excellence and fostering a nurturing environment for students in Gambella, Ethiopia.",
  keywords: ["Trinity Lutheran College", "Gambella", "Ethiopia", "university", "higher education"],
  openGraph: {
    type: "website",
    locale: "en_ET",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "Trinity Lutheran College",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-source antialiased bg-stone-50 text-stone-800">
        <SessionProvider>
          <NavigationProgressProvider>
            <SiteChrome>{children}</SiteChrome>
          </NavigationProgressProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
