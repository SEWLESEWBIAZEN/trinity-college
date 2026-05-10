"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  GraduationCap,
  Library,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STAT_ITEMS = [
  { value: "2017", label: "Year Founded", icon: Award },
  { value: "3.2 ha", label: "Campus Area", icon: GraduationCap },
  { value: "15,219", label: "Library Books", icon: Library },
  { value: "6+", label: "Programs Offered", icon: Users },
];

const IMAGE_SLIDES = [
  {
    src: "/images/hero/campus-1.png",
    alt: "Trinity Lutheran College campus building",
  },
  {
    src: "/images/hero/campus-2.png",
    alt: "Trinity Lutheran College campus classrooms and walkway",
  },
  {
    src: "/images/hero/campus-3.png",
    alt: "Trinity Lutheran College campus facility",
  },
];

export default function HeroCarousel() {
  const totalSlides = 1 + IMAGE_SLIDES.length;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [totalSlides]);

  const goToPrev = () => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToNext = () => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  };

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
      >
        <div className="relative min-h-[90vh] w-full shrink-0 flex items-center overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg,var(--clr-navy) 60%,#2a4080 100%)",
            }}
          />

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-10"
              style={{ background: "var(--clr-gold)" }}
            />
            <div
              className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5"
              style={{ background: "var(--clr-gold-lt)" }}
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <span className="badge badge-gold text-xs mb-5">
                Gambella, Ethiopia · Est. 2017
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
                Advancing
                <br />
                <span style={{ color: "var(--clr-gold-lt)" }}>Academic</span>
                <br />
                Excellence
              </h1>
              <p className="text-lg text-white/75 mb-8 max-w-xl leading-relaxed">
                Trinity Lutheran College fosters a nurturing learning environment for
                students in one of Ethiopia&apos;s most dynamic regions — building
                tomorrow&apos;s leaders today.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/programs" className="btn-gold">
                  Explore Programs <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/admissions"
                  className="btn-outline"
                  style={{ borderColor: "rgba(255,255,255,.4)", color: "#fff" }}
                >
                  How to Apply
                </Link>
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-4 animate-fade-up delay-200">
              {STAT_ITEMS.map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-xl p-6 flex flex-col gap-3"
                  style={{
                    background: "rgba(255,255,255,.07)",
                    border: "1px solid rgba(255,255,255,.12)",
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: "var(--clr-gold-lt)" }} />
                  <span className="font-playfair text-3xl font-bold text-white">
                    {value}
                  </span>
                  <span className="text-sm text-white/60">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {IMAGE_SLIDES.map((slide) => (
          <div key={slide.src} className="relative min-h-[90vh] w-full shrink-0">
            <img
              src={slide.src}
              alt={slide.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous slide"
        onClick={goToPrev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center bg-black/35 hover:bg-black/55 text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        aria-label="Next slide"
        onClick={goToNext}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center bg-black/35 hover:bg-black/55 text-white transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setActiveSlide(index)}
            className={`h-2.5 rounded-full transition-all ${
              activeSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/55 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
