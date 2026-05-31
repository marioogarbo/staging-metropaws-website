import Image from "next/image";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

type FooterVariant = "navy" | "photo";

interface SiteFooterProps {
  variant?: FooterVariant;
}

const contactItems = [
  { icon: Phone, label: "0920-922-4486", href: "tel:09209224486" },
  { icon: Mail, label: "csr@metropaws.ph", href: "mailto:csr@metropaws.ph" },
  {
    icon: FacebookIcon,
    label: "MetroPaws",
    href: "https://www.facebook.com/people/Metropaws/61588899502470/",
  },
];

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Plans & Pricing", href: "/#pricing" },
  { label: "Founding 50", href: "/#founding" },
  { label: "FAQ", href: "/#faq" },
  { label: "About Us", href: "/about" },
  { label: "Our Mission", href: "/about#mission" },
  { label: "Our Values", href: "/about#values" },
  { label: "Register", href: "/register" },
];

function FooterContent() {
  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        {/*
          Desktop: 4-column grid — logo 2fr, Quick Links / Staff / Contact each 1fr.
          Mobile: 2-col grid. Logo and Contact span full width; Quick Links and Staff
          share a row side-by-side. No md:contents trick needed.
        */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-x-16 md:gap-y-0">
          {/* Logo + tagline — full width on mobile */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-start gap-3">
            <Image
              src="/logo-full-white-metro.png"
              alt="MetroPaws Wellness Club"
              width={160}
              height={44}
              className="h-9 w-auto"
            />
            <p className="text-white/60 text-sm max-w-[32ch] leading-relaxed">
              Pet wellness membership for Metro Manila families.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-start">
            <span className="text-(--color-gold) text-sm font-semibold uppercase tracking-widest mb-3">
              Quick Links
            </span>
            {quickLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-white/70 text-sm py-2 hover:text-(--color-gold) transition-colors duration-150"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Staff */}
          <div className="flex flex-col items-start">
            <span className="text-(--color-gold) text-sm font-semibold uppercase tracking-widest mb-3">
              Staff
            </span>
            <Link
              href="/admin/login"
              className="text-white/70 text-sm py-2 hover:text-(--color-gold) transition-colors duration-150"
            >
              Staff Login
            </Link>
          </div>

          {/* Contact — full width on mobile */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-start">
            <span className="text-(--color-gold) text-sm font-semibold uppercase tracking-widest mb-3">
              Contact Us
            </span>
            {contactItems.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2.5 text-white/70 text-sm py-2 hover:text-(--color-gold) transition-colors duration-150 group"
              >
                <Icon className="w-4 h-4 shrink-0 text-white/50 group-hover:text-(--color-gold) transition-colors duration-150" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <p className="text-white/30 text-sm text-center">
            © 2026 MetroPaws Wellness Club. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}

export function SiteFooter({ variant = "navy" }: SiteFooterProps) {
  if (variant === "photo") {
    return (
      <footer className="relative">
        <Image
          src="/hero-background.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "oklch(0.22 0.052 258 / 0.88)" }}
        />
        <div className="relative z-10">
          <FooterContent />
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-(--color-navy)">
      <FooterContent />
    </footer>
  );
}
