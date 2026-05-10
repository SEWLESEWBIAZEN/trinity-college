"use client";
// src/components/admin/AdminSidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import CollegeLogo from "@/components/branding/CollegeLogo";
import { useNavigationProgress } from "@/components/navigation/NavigationProgressProvider";
import {
  LayoutDashboard, GraduationCap, Image, Users,
  FileText, MessageSquare, Settings, BookOpen, ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/admin",               label: "Dashboard",     icon: LayoutDashboard },
  { href: "/admin/programs",      label: "Programs",      icon: GraduationCap },
  { href: "/admin/media",         label: "Media",         icon: Image },
  { href: "/admin/staff",         label: "Staff",         icon: Users },
  { href: "/admin/announcements", label: "Announcements", icon: FileText },
  { href: "/admin/admissions",    label: "Admissions",    icon: BookOpen },
  { href: "/admin/services",      label: "Services",      icon: BookOpen },
  { href: "/admin/messages",      label: "Messages",      icon: MessageSquare },
  { href: "/admin/content",       label: "Site Content",  icon: Settings },
];

export default function AdminSidebar() {
  const path = usePathname();
  const { startNavigation } = useNavigationProgress();

  const handleLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (href !== path) {
      startNavigation();
    }
  };

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-white border-r border-stone-200 overflow-y-auto">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-stone-100">
        <CollegeLogo size={32} className="rounded-lg" />
        <span className="font-playfair text-sm font-bold leading-tight"
          style={{ color: "var(--clr-navy)" }}>
          TLC <span className="font-source font-normal text-stone-400 text-xs">Admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
          return (
            <Link key={href} href={href}
              onClick={(event) => handleLinkClick(event, href)}
              className={clsx("nav-item group", active && "active")}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-stone-100">
        <Link href="/" target="_blank"
          className="nav-item text-stone-400 hover:text-stone-600 text-xs">
          ↗ View Website
        </Link>
      </div>
    </aside>
  );
}
