import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WellnessCheckHero } from "@/components/wellness-check-hero";
import { WellnessCheck } from "@/components/wellness-check";
import { WellnessCheckExplainer } from "@/components/wellness-check-explainer";

export const metadata: Metadata = {
  title: "Pet Wellness Readiness Check | MetroPaws Wellness Club",
  description:
    "Answer eight quick questions about your pet's preventive-care routine and get a readiness score out of 100, plus a simple 12-month planning guide you can print or save.",
};

function WellnessCheckSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse motion-reduce:animate-none rounded-xl border border-(--color-ink-faint) bg-(--color-surface) p-6 md:p-8"
    >
      <div className="h-6 w-2/3 rounded bg-(--color-cream-warm)" />
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        <div className="h-24 rounded-xl bg-(--color-cream-warm)" />
        <div className="h-24 rounded-xl bg-(--color-cream-warm)" />
      </div>
      <div className="mt-6 h-11 w-full rounded-lg bg-(--color-cream-warm)" />
    </div>
  );
}

export default function WellnessCheckPage() {
  return (
    <div className="flex flex-col min-h-svh overflow-x-clip">
      <div className="print:hidden">
        <SiteHeader />
      </div>
      <main className="flex flex-col flex-1">
        <div className="print:hidden">
          <WellnessCheckHero />
        </div>
        {/* Required, not decorative: the check reads ?src= with
            useSearchParams, and an unwrapped call in a statically rendered
            route is a prerender error that fails the production build. Keeping
            it client-side leaves the page on the edge cache, so the booth's
            first paint costs no server work. */}
        <Suspense
          fallback={
            <section className="bg-(--color-cream) pb-20 md:pb-28">
              <div className="max-w-6xl mx-auto px-6">
                <WellnessCheckSkeleton />
              </div>
            </section>
          }
        >
          <WellnessCheck />
        </Suspense>
        <WellnessCheckExplainer />
      </main>
      <div className="print:hidden">
        <SiteFooter variant="photo" />
      </div>
    </div>
  );
}
