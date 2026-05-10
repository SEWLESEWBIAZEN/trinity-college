"use client";
// src/components/layout/Navbar.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import CollegeLogo from "@/components/branding/CollegeLogo";
import { useNavigationProgress } from "@/components/navigation/NavigationProgressProvider";

const NAV_LINKS = [
  { href: "/",               label: "Home" },
  { href: "/about",          label: "About" },
  { href: "/programs",       label: "Programs" },
  { href: "/admissions",     label: "Admissions" },
  { href: "/student-services", label: "Student Services" },
  { href: "/news",           label: "News & Events" },
  { href: "/media",          label: "Media" },
  { href: "/contact",        label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

    if (href !== pathname) {
      startNavigation();
    }
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={clsx(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur shadow-card border-b border-stone-200"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          onClick={(event) => handleLinkClick(event, "/")}
          className="flex items-center gap-2.5 shrink-0"
        >
          <CollegeLogo size={36} className="rounded-lg" />
          <span className="hidden sm:block font-playfair font-bold text-base leading-tight"
            style={{ color: "var(--clr-navy)" }}>
            Trinity Lutheran<br />
            <span className="text-xs font-source font-normal tracking-widest uppercase"
              style={{ color: "var(--clr-gold)" }}>College</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={(event) => handleLinkClick(event, href)}
                  className={clsx(
                    "px-3.5 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "text-white"
                      : "text-stone-700 hover:text-stone-900 hover:bg-stone-100"
                  )}
                  style={active ? { background: "var(--clr-navy)" } : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <Link
          href="/admissions"
          onClick={(event) => handleLinkClick(event, "/admissions")}
          className="btn-gold hidden lg:inline-flex text-xs px-4 py-2"
        >
          Apply Now
        </Link>

        {/* Mobile burger */}
        <button
          className="lg:hidden p-2 rounded-md"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-stone-200 px-4 py-4 space-y-1 animate-fade-in">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={(event) => {
                  handleLinkClick(event, href);
                  setOpen(false);
                }}
                className={clsx(
                  "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "text-white" : "text-stone-700 hover:bg-stone-100"
                )}
                style={active ? { background: "var(--clr-navy)" } : undefined}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/admissions"
            onClick={(event) => {
              handleLinkClick(event, "/admissions");
              setOpen(false);
            }}
            className="btn-gold w-full justify-center mt-2"
          >
            Apply Now
          </Link>
        </div>
      )}
    </header>
  );
}
