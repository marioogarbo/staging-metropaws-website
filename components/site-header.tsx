"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [barVisible, setBarVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "About", href: "/about" },
    { label: "Founding", href: "/#founding" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
  ] as const;

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar — grid-rows collapse for smooth dismiss */}
      <div
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{ display: "grid", gridTemplateRows: barVisible ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="bg-(--color-navy)">
            {/* Desktop single-row layout */}
            <div className="hidden md:flex items-center justify-center gap-3 py-3 px-12 relative">
              <button
                onClick={() => setBarVisible(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1 rounded"
                aria-label="Dismiss announcement"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-(--color-gold) text-sm font-bold uppercase tracking-widest">
                FOUNDING 50
              </span>
              <span className="text-white/25 text-sm select-none">|</span>
              <span className="text-white/85 text-sm">
                Locked-in pricing for our first 50 families. Spots are open now.
              </span>
              <Link
                href="#founding"
                className="text-(--color-gold) text-sm font-semibold ml-2 hover:opacity-75 transition-opacity"
              >
                Reserve yours →
              </Link>
            </div>

            {/* Mobile stacked layout */}
            <div className="md:hidden relative px-4 py-3 text-center">
              <button
                onClick={() => setBarVisible(false)}
                className="absolute right-3 top-3 text-white/40 hover:text-white/80 transition-colors p-1 rounded"
                aria-label="Dismiss announcement"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-(--color-gold) text-sm font-bold uppercase tracking-widest">
                FOUNDING 50
              </div>
              <div className="text-white/85 text-sm mt-1 pr-6">
                Locked-in pricing for our first 50 families. Spots are open now.
              </div>
              <Link
                href="#founding"
                className="text-(--color-gold) text-sm font-semibold mt-2 inline-block hover:opacity-75 transition-opacity"
              >
                Reserve yours →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-(--color-surface) border-b border-(--color-ink-faint) h-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-2 md:gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/logo-full.png"
              alt="MetroPaws Wellness Club"
              width={160}
              height={44}
              className="h-8 md:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-medium text-(--color-ink-muted) hover:text-(--color-navy) transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right: CTA + hamburger */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <Link
              href="#founding"
              className="bg-(--color-gold) text-(--color-navy) text-sm font-semibold rounded-lg px-3 py-2.5 md:px-5 hover:brightness-105 transition-all whitespace-nowrap"
            >
              Reserve Your Spot
            </Link>
            <button
              className="md:hidden text-(--color-ink-muted) p-2 hover:text-(--color-navy) transition-colors rounded"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <Menu
                className={cn(
                  "w-5 h-5 transition-transform duration-150",
                  menuOpen && "rotate-90",
                )}
              />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div
          className="md:hidden overflow-hidden transition-all duration-200 ease-out"
          style={{ display: "grid", gridTemplateRows: menuOpen ? "1fr" : "0fr" }}
        >
          <div className="min-h-0 overflow-hidden bg-(--color-surface) border-t border-(--color-ink-faint)">
            <div className="flex flex-col px-6">
              {navLinks.map(({ label, href }, i) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "py-4 text-sm font-medium text-(--color-ink-muted) hover:text-(--color-navy) transition-colors",
                    i < navLinks.length - 1 && "border-b border-(--color-ink-faint)",
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
