"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Check, Copy, QrCode } from "lucide-react";

/**
 * The printable booth QR.
 *
 * The expo URL has to be exactly right or the source tag is lost and the leads
 * land in the website bucket. Rendering it here means nobody retypes it into a
 * third-party QR site, and `react-qr-code` is already a dependency.
 */
const BOOTH_URL = "https://www.metropaws.ph/wellness-check?src=wpe2026";

export function BoothQrCard() {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(BOOTH_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked in some contexts; the URL is on screen anyway.
    }
  }

  return (
    <details className="group mb-6 rounded-xl border border-[oklch(0.88_0.010_258)] bg-[oklch(0.99_0.005_80)] print:border-0">
      <summary
        className={[
          "list-none [&::-webkit-details-marker]:hidden",
          "flex min-h-11 cursor-pointer items-center gap-2.5 px-4 py-3",
          "text-sm font-semibold text-[oklch(0.24_0.055_258)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.115_82)] rounded-xl",
          "print:hidden",
        ].join(" ")}
      >
        <QrCode size={15} aria-hidden="true" />
        World Pet Expo booth QR
        <span className="font-normal text-[oklch(0.55_0.018_258)]">
          &middot; print and scan-test before the 24th
        </span>
      </summary>

      <div className="flex flex-col items-start gap-5 border-t border-[oklch(0.92_0.010_258)] p-5 sm:flex-row sm:items-center print:border-0">
        <div className="rounded-lg bg-white p-3">
          <QRCode value={BOOTH_URL} size={148} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[oklch(0.24_0.055_258)]">
            Scans land on the readiness check, tagged as expo
          </p>
          <p className="mt-1.5 text-xs break-all text-[oklch(0.55_0.018_258)]">
            {BOOTH_URL}
          </p>
          <button
            type="button"
            onClick={copyUrl}
            className={[
              "mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 py-1.5 print:hidden",
              "border-[oklch(0.91_0.010_258)] text-xs font-semibold text-[oklch(0.24_0.055_258)]",
              "hover:bg-[oklch(0.97_0.008_80)] transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.115_82)]",
            ].join(" ")}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
    </details>
  );
}
