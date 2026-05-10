// src/components/layout/Footer.tsx
import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Twitter, Youtube } from "lucide-react";
import CollegeLogo from "@/components/branding/CollegeLogo";

const PROGRAMS = [
  { href: "/programs/clinical-nursing",        label: "Diploma in Clinical Nursing" },
  { href: "/programs/nursing",                 label: "B.Sc Nursing" },
  { href: "/programs/midwifery",               label: "B.Sc Midwifery" },
  { href: "/programs/accounting",              label: "B.Sc Accounting" },
  { href: "/programs/human-resource-management", label: "B.Sc Human Resource Mgmt" },
  { href: "/programs/social-work",             label: "B.Sc Social Work" },
];

const QUICK = [
  { href: "/about",            label: "About Us" },
  { href: "/admissions",       label: "Admissions" },
  { href: "/student-services", label: "Student Services" },
  { href: "/media",            label: "Media Gallery" },
  { href: "/contact",          label: "Contact Us" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--clr-navy)" }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <CollegeLogo
                size={36}
                className="rounded-lg bg-white"
                imageClassName="p-0.5"
              />
              <span className="font-playfair font-bold text-base leading-tight">
                Trinity Lutheran<br />
                <span className="text-xs font-source font-normal tracking-widest"
                  style={{ color: "var(--clr-gold-lt)" }}>COLLEGE</span>
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-5">
              Advancing academic excellence and fostering a nurturing environment for students in Gambella, Ethiopia since 2017.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Programs */}
          <div>
            <h3 className="font-playfair font-semibold text-base mb-4"
              style={{ color: "var(--clr-gold-lt)" }}>Programs</h3>
            <ul className="space-y-2">
              {PROGRAMS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}
                    className="text-sm text-white/70 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-playfair font-semibold text-base mb-4"
              style={{ color: "var(--clr-gold-lt)" }}>Quick Links</h3>
            <ul className="space-y-2">
              {QUICK.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}
                    className="text-sm text-white/70 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-playfair font-semibold text-base mb-4"
              style={{ color: "var(--clr-gold-lt)" }}>Contact</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-white/40" />
                Kebele 01, Salam Safer, Gambella, Ethiopia
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0 text-white/40" />
                <div>
                  <a href="tel:0910004827" className="hover:text-white transition-colors block">0910 004 827</a>
                  <a href="tel:0901003098" className="hover:text-white transition-colors block">0901 003 098</a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 shrink-0 text-white/40" />
                <a href="mailto:manpign@gmail.com" className="hover:text-white transition-colors">
                  manpign@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>© {year} Trinity Lutheran College. All rights reserved.</span>
          <span>Established September 16, 2017 · Gambella, Ethiopia</span>
        </div>
      </div>
    </footer>
  );
}
