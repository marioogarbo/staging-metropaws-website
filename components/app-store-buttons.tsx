import Link from "next/link";

function AppleStoreBadge({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 bg-[oklch(0.18_0.045_258)] border border-white/15 rounded-lg px-4 py-2.5 transition-all duration-200 ease-out hover:border-white/30 hover:bg-[oklch(0.22_0.052_258)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-gold] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.22_0.052_258)]"
      aria-label="Download on the App Store"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      <div>
        <div className="text-[9px] text-white/55 font-medium leading-none tracking-wide">
          Download on the
        </div>
        <div className="text-sm text-white font-semibold leading-tight mt-0.5">App Store</div>
      </div>
    </Link>
  );
}

function PlayStoreBadge({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 bg-[oklch(0.18_0.045_258)] border border-white/15 rounded-lg px-4 py-2.5 transition-all duration-200 ease-out hover:border-white/30 hover:bg-[oklch(0.22_0.052_258)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-gold] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.22_0.052_258)]"
      aria-label="Get it on Google Play"
    >
      <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
        <path
          d="M0.426 0.18C0.16.432 0 .826 0 1.337v17.326c0 .511.16.905.426 1.157l.06.058L10.104 10v-.178L.487.12z"
          fill="#4285F4"
        />
        <path
          d="M13.356 13.37l-3.252-3.37v-.178l3.252-3.37.073.042 3.855 2.19c1.1.625 1.1 1.649 0 2.274l-3.855 2.19z"
          fill="#FBBC04"
        />
        <path
          d="M13.43 13.328L10.104 10 0.426 19.82c.362.383.958.43 1.623.049L13.43 13.328z"
          fill="#EA4335"
        />
        <path
          d="M13.43 6.672L2.049.131C1.384-.25.788-.203.426.18L10.104 10z"
          fill="#34A853"
        />
      </svg>
      <div>
        <div className="text-[9px] text-white/55 font-medium leading-none tracking-wide">
          Get it on
        </div>
        <div className="text-sm text-white font-semibold leading-tight mt-0.5">Google Play</div>
      </div>
    </Link>
  );
}

export function AppStoreButtons({
  appStoreHref = "#",
  playStoreHref = "#",
}: {
  appStoreHref?: string;
  playStoreHref?: string;
}) {
  return (
    <div className="flex flex-row gap-3">
      <AppleStoreBadge href={appStoreHref} />
      <PlayStoreBadge href={playStoreHref} />
    </div>
  );
}
