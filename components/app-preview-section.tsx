import Image from "next/image";

export function AppPreviewSection() {
  return (
    <section
      aria-labelledby="app-preview-heading"
      className="bg-(--color-navy) py-24 md:py-32 overflow-hidden contain-paint"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-16 xl:px-24">
        <div className="flex flex-col lg:flex-row lg:items-center gap-14 lg:gap-16 xl:gap-24">
          {/* Copy — left on desktop, centered above on mobile/tablet */}
          <div className="mp-reveal shrink-0 lg:w-5/12 text-center lg:text-left">
            <p
              aria-hidden="true"
              className="text-sm font-semibold uppercase tracking-widest text-(--color-gold)"
            >
              See It In Action
            </p>
            <h2
              id="app-preview-heading"
              className="mt-3 text-2xl md:text-3xl font-bold leading-tight tracking-tight text-white"
            >
              Your pet&apos;s full profile,
              <br />
              always in your pocket.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60 max-w-[48ch] lg:max-w-none mx-auto lg:mx-0">
              Walk into any partner clinic, tap once, and show your pet&apos;s QR ID. No
              paperwork. No repeating yourself.
            </p>
          </div>

          {/* Phones */}
          <div className="mp-reveal flex-1 flex items-end justify-center lg:justify-end gap-4 md:gap-5 xl:gap-7 pb-8 lg:pb-0">
            {/* Phone 1 — Homescreen (hidden on mobile, shown sm+) */}
            <div
              aria-hidden="true"
              className="relative shrink-0 hidden sm:block w-40 md:w-44 lg:w-50 xl:w-52 translate-y-6 md:translate-y-10 opacity-75"
            >
              <PhoneFrame>
                <Image
                  src="/mobile-app-homescreen.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 0px, (max-width: 768px) 160px, (max-width: 1024px) 176px, 208px"
                  className="object-cover object-top"
                  loading="lazy"
                />
              </PhoneFrame>
            </div>

            {/* Phone 2 — QR screen (front, elevated) */}
            <div className="relative shrink-0 w-52 sm:w-48 md:w-54 lg:w-58 xl:w-62">
              <div className="mp-float">
                <PhoneFrame primary>
                  <Image
                    src="/mobile-app-qr-screen.jpg"
                    alt="MetroPaws app — QR Pet ID screen shown to clinic staff"
                    fill
                    sizes="(max-width: 640px) 208px, (max-width: 768px) 192px, (max-width: 1024px) 216px, 248px"
                    className="object-cover object-top"
                    loading="lazy"
                  />
                </PhoneFrame>
                {/* Gold accent label — inside mp-float so it travels with the phone */}
                <p className="mt-4 text-center text-xs font-semibold uppercase tracking-widest text-(--color-gold)">
                  Show at clinic
                </p>
              </div>
            </div>

            {/* Phone 3 — booking screen (shown xl+ only) */}
            <div
              aria-hidden="true"
              className="relative shrink-0 hidden xl:block w-48 translate-y-6 xl:translate-y-10 opacity-55"
            >
              <PhoneFrame>
                <Image
                  src="/mobile-app-book-screen.jpg"
                  alt=""
                  fill
                  sizes="192px"
                  className="object-cover object-top"
                  loading="lazy"
                />
              </PhoneFrame>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* PhoneFrame — notch overlays screen so Image fill works cleanly      */
/* ------------------------------------------------------------------ */

interface PhoneFrameProps {
  children: React.ReactNode;
  primary?: boolean;
}

function PhoneFrame({ children, primary = false }: PhoneFrameProps) {
  return (
    <div
      className={[
        "relative rounded-4xl overflow-hidden",
        "ring-[3px]",
        primary
          ? "ring-(--color-gold) shadow-[0_0_48px_oklch(0.72_0.115_82/0.18)]"
          : "ring-white/10",
        "aspect-9/19.5",
      ].join(" ")}
    >
      {/* Screen content fills the full frame */}
      <div className="absolute inset-0">{children}</div>

      {/* Notch bar — overlaid at z-10 above screen */}
      <div className="absolute top-0 inset-x-0 h-6.5 z-10 flex items-center justify-center bg-black/80">
        <div className="w-14 h-3.5 rounded-full bg-black" />
      </div>
    </div>
  );
}
