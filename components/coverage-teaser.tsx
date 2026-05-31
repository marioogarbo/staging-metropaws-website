import Link from "next/link";
import { ShieldCheck, Wifi, Users } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    label: "The 5K Shield",
    detail: "Annual emergency coverage up to ₱5,000 at partner clinics.",
  },
  {
    icon: Wifi,
    label: "The Offline Guarantee",
    detail: "Physical cards and a Partner Whitelist — works even without signal.",
  },
  {
    icon: Users,
    label: "The Pack Network",
    detail: 'Curated "Class A" vets and groomers across Las Piñas.',
  },
];

export function CoverageTeaser() {
  return (
    <section className="bg-(--color-cream-warm) py-14 md:py-18 border-y border-(--color-ink-faint)">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Left: label + blurb */}
          <div className="shrink-0 md:max-w-[28ch]">
            <p className="text-sm font-semibold uppercase tracking-widest text-(--color-gold)">
              What&apos;s Covered
            </p>
            <p className="mt-2 text-sm leading-relaxed text-(--color-ink-muted)">
              Every plan is backed by the same core protection system.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-(--color-navy) hover:text-(--color-gold) transition-colors"
            >
              Full service details →
            </Link>
          </div>

          {/* Divider (desktop) */}
          <div className="hidden md:block w-px self-stretch bg-(--color-ink-faint)" />

          {/* Right: three pillars */}
          <div className="flex flex-col sm:flex-row gap-8 flex-1 md:pl-6">
            {pillars.map(({ icon: Icon, label, detail }) => (
              <div key={label} className="flex gap-3 items-start flex-1">
                <div className="mt-0.5 shrink-0">
                  <Icon
                    className="w-4 h-4 text-(--color-gold)"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-(--color-navy)">{label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-(--color-ink-muted)">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
