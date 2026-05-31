import Link from "next/link";
import { AppStoreButtons } from "@/components/app-store-buttons";

export function HeroSection() {
  return (
    <section className="relative flex-1 min-h-155 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-clean.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Mobile overlay: bottom-to-top navy scrim */}
      <div
        aria-hidden="true"
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(to top, oklch(0.22 0.052 258 / 0.97) 0%, oklch(0.22 0.052 258 / 0.88) 28%, oklch(0.22 0.052 258 / 0.55) 52%, oklch(0.22 0.052 258 / 0.15) 75%, transparent 92%)",
        }}
      />

      {/* Desktop overlay: left edge reduced 0.93 → 0.72 so the image breathes */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(108deg, oklch(0.22 0.052 258 / 0.72) 0%, oklch(0.22 0.052 258 / 0.80) 28%, oklch(0.22 0.052 258 / 0.42) 50%, oklch(0.22 0.052 258 / 0.08) 68%, transparent 80%)",
        }}
      />

      <div className="absolute inset-0 z-10 flex items-end lg:items-center">
        <div className="px-6 pb-14 lg:pb-0 lg:px-16 xl:px-24">
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            <span className="block text-white mp-rise [animation-delay:80ms]">
              Pet Wellness
            </span>
            <span className="block text-(--color-gold) mp-rise [animation-delay:220ms]">
              Shouldn&apos;t be
            </span>
            <span className="block text-white mp-rise [animation-delay:360ms]">
              a Gamble.
            </span>
          </h1>

          <p className="text-white/75 text-sm leading-relaxed mt-4 max-w-[42ch] mp-rise [animation-delay:520ms]">
            Your pet&apos;s QR ID, session tracker, and vaccination records in one place.
            Free to register, always in your pocket.
          </p>

          <div className="mt-10 lg:mt-8 mp-rise [animation-delay:660ms]">
            <Link
              href="#founding"
              className="inline-flex items-center justify-center w-full lg:w-auto bg-(--color-gold) text-(--color-navy) text-sm font-semibold rounded-lg px-8 py-4 transition-all duration-200 ease-out hover:brightness-105 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-navy)"
            >
              Reserve Your Founding Spot →
            </Link>
          </div>

          <div className="mt-4 mp-rise [animation-delay:820ms]">
            <AppStoreButtons />
          </div>
        </div>
      </div>
    </section>
  );
}
