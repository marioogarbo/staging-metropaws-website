"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import {
  TOTAL_POINTS,
  WELLNESS_BANDS,
  type AreaBreakdown,
  type WellnessResult,
} from "@/lib/wellness-scoring";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "queued";

interface WellnessCheckResultProps {
  result: WellnessResult;
  displayName: string;
  petType: string;
  annualSpend: string;
  saveStatus: SaveStatus;
  onCheckAnother: () => void;
}

const BAND_RANGES = WELLNESS_BANDS.map((band, index) => {
  const above = WELLNESS_BANDS[index - 1];
  return {
    ...band,
    range: above
      ? `${band.minimum}-${above.minimum - 1}`
      : `${band.minimum}-100`,
  };
});

function formattedToday(): string {
  return new Date().toLocaleDateString("en-PH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BreakdownList({ items }: { items: AreaBreakdown[] }) {
  return (
    <ul className="mt-4">
      {items.map((item) => (
        <li
          key={item.key}
          className="flex items-start justify-between gap-4 border-t border-(--color-ink-faint) pt-4 mt-4 first:border-0 first:pt-0 first:mt-0"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-(--color-ink)">
              {item.shortLabel}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-(--color-ink-muted)">
              {item.answerLabel}
            </p>
          </div>
          <p className="shrink-0 text-sm font-semibold tabular-nums text-(--color-navy)">
            {item.points} / {item.maxPoints}
          </p>
        </li>
      ))}
    </ul>
  );
}

/**
 * The score, and what to do about it.
 *
 * There is no coloured band here and no ring. The palette has navy, gold and
 * cream and no semantic success or danger tokens, and gold is never a
 * decorative fill, so the prototype's gold conic gradient and its green/amber/
 * red band text both had to go. What replaces them is a ladder showing all four
 * bands with the visitor's own rung inverted: a red badge says "you are bad",
 * whereas a ladder says "here is the scale, and here is you". It also makes 49
 * against 51 read as just below a line rather than as a change of category, and
 * it is legible without colour vision.
 */
export function WellnessCheckResult({
  result,
  displayName,
  petType,
  annualSpend,
  saveStatus,
  onCheckAnother,
}: WellnessCheckResultProps) {
  const { totalScore, band, strongAreas, areasToStrengthen, roadmap } = result;
  const everythingIsStrong = areasToStrengthen.length === 0;

  return (
    <div className="mp-rise">
      {/* Print-only masthead. A printed page has no clickable links, so the
          address is spelled out. */}
      <div className="hidden print:block">
        <p className="text-base font-bold text-(--color-navy)">
          MetroPaws Wellness Club
        </p>
        <p className="mt-1 text-sm text-(--color-ink-muted)">
          metropaws.ph &middot; Wellness readiness check for {displayName} (
          {petType}) &middot; {formattedToday()}
        </p>
        <p className="mt-1 text-sm font-semibold text-(--color-navy)">
          Not a veterinary record.
        </p>
      </div>

      <section className="mp-print-panel mp-avoid-break rounded-xl bg-(--color-navy) p-8 md:p-10 print:mt-4 print:p-0">
        <p className="text-sm font-semibold uppercase tracking-widest text-(--color-gold) print:text-(--color-ink-muted)">
          Wellness readiness
        </p>

        <div className="mt-4 flex items-baseline gap-2">
          {/* The one gold thing in this panel. A score out of 100 is a stat
              figure, which is a sanctioned gold use, and gold on navy is
              about 6.6:1. */}
          <span className="text-5xl md:text-6xl font-bold tabular-nums tracking-tight text-(--color-gold) print:text-(--color-navy)">
            {totalScore}
          </span>
          <span className="text-xl font-bold text-white/45 print:text-(--color-ink-muted)">
            / {TOTAL_POINTS}
          </span>
        </div>

        {/* Monochrome track with the band edges marked, so a bare number reads
            as "near the top of its band" rather than as a number. */}
        <div
          aria-hidden="true"
          className="relative mt-6 h-1.5 w-full rounded-full bg-white/12 print:hidden"
        >
          <div
            className="h-1.5 rounded-full bg-(--color-surface)"
            style={{ width: `${totalScore}%` }}
          />
          {WELLNESS_BANDS.filter((edge) => edge.minimum > 0).map((edge) => (
            <span
              key={edge.minimum}
              className="absolute top-0 h-1.5 w-px bg-(--color-navy)"
              style={{ left: `${edge.minimum}%` }}
            />
          ))}
        </div>

        <h2 className="mt-6 text-2xl md:text-3xl font-bold tracking-tight leading-tight text-white text-balance print:text-(--color-navy)">
          {band.name}
        </h2>
        <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-(--color-silver) print:text-(--color-ink-muted)">
          {band.reading}
        </p>

        <ol className="mt-8 flex flex-col gap-1 print:hidden">
          {BAND_RANGES.map((rung) => {
            const isYours = rung.minimum === band.minimum;
            return (
              <li
                key={rung.minimum}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-lg px-4 py-3",
                  isYours
                    ? "bg-(--color-surface) text-(--color-navy)"
                    : "text-white/45",
                )}
              >
                <span className="text-sm font-semibold tabular-nums">
                  {rung.range}
                </span>
                <span
                  className={cn(
                    "text-right text-sm",
                    isYours ? "font-semibold" : "font-normal",
                  )}
                >
                  {rung.name}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* A hairline rule, not a tinted box. A tint reads as an aside to skip,
          and tinting it would mean reaching for a warning colour the palette
          does not have. Body size, not small print: the size parity is the
          point. */}
      <p className="mt-6 flex items-start gap-2.5 border-t border-(--color-ink-faint) pt-5 text-sm leading-relaxed text-(--color-ink-muted)">
        <Info
          size={16}
          className="mt-0.5 shrink-0 text-(--color-navy)"
          aria-hidden="true"
        />
        <span>
          <strong className="font-semibold text-(--color-navy)">
            A readiness score, not a diagnosis.
          </strong>{" "}
          This is not a veterinary examination and cannot diagnose anything. It
          reflects only the eight answers given, and it does not replace a
          consultation with a licensed veterinarian. Ask your vet about anything
          that concerns you.
        </span>
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 print:grid-cols-2 print:gap-4">
        <div className="mp-avoid-break rounded-xl border border-(--color-ink-faint) bg-(--color-surface) p-6 md:p-8 print:p-4">
          <h3 className="text-base font-semibold text-(--color-navy)">
            Strong areas{" "}
            <span className="text-sm font-normal tabular-nums text-(--color-ink-muted)">
              &middot; {strongAreas.length}
            </span>
          </h3>
          {strongAreas.length ? (
            <BreakdownList items={strongAreas} />
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-(--color-ink-muted)">
              Nothing scored full marks this time. The plan below starts with
              the area that carries the most weight.
            </p>
          )}
        </div>

        <div className="mp-avoid-break rounded-xl border border-(--color-ink-faint) bg-(--color-cream-warm) p-6 md:p-8 print:p-4">
          <h3 className="text-base font-semibold text-(--color-navy)">
            Areas to strengthen{" "}
            <span className="text-sm font-normal tabular-nums text-(--color-ink-muted)">
              &middot; {areasToStrengthen.length}
            </span>
          </h3>
          {areasToStrengthen.length ? (
            <BreakdownList items={areasToStrengthen} />
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-(--color-ink-muted)">
              All eight areas scored full marks.
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-base font-semibold text-(--color-navy)">
          {everythingIsStrong
            ? "12-Month Maintenance Plan"
            : "12-Month Wellness Planning Guide"}
        </h3>
        <ol className="mt-5 border-l border-(--color-ink-faint) ps-11 md:grid md:grid-cols-3 md:gap-6 md:border-l-0 md:ps-0">
          {roadmap.map((step, index) => (
            <li
              key={step.timeframe}
              className="mp-avoid-break relative pb-8 md:pb-0"
            >
              <span
                aria-hidden="true"
                className="absolute -left-11 flex h-8 w-8 items-center justify-center rounded-full bg-(--color-gold) text-sm font-bold tabular-nums text-(--color-navy) md:static md:mb-4 md:flex"
              >
                {index + 1}
              </span>
              <p className="text-sm font-semibold uppercase tracking-widest text-(--color-gold-deep)">
                {step.timeframe}
              </p>
              <p className="mt-2 text-base font-bold text-(--color-navy)">
                {step.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-(--color-ink-muted)">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {annualSpend ? (
        <p className="mt-6 hidden text-sm text-(--color-ink-muted) print:block">
          Estimated annual wellness spend: {annualSpend}
        </p>
      ) : null}

      <p className="mt-8 hidden text-sm text-(--color-ink-muted) print:block">
        Bring this to your next vet visit. Membership: metropaws.ph/register
      </p>

      <div className="mt-10 rounded-xl bg-(--color-navy) p-8 md:p-10 print:hidden">
        <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-tight text-white text-balance">
          Plan {displayName}&rsquo;s year with MetroPaws
        </h3>
        <p className="mt-4 max-w-[54ch] text-sm leading-relaxed text-(--color-silver)">
          Membership keeps the records, the reminders and the preventive-care
          budget in one place, with partner clinics that already have your
          pet&rsquo;s history when you walk in.
        </p>
        <Link
          href="/register"
          className={[
            "mt-8 inline-flex w-full min-h-11 items-center justify-center rounded-lg sm:w-auto",
            "bg-(--color-gold) px-6 py-3 text-sm font-semibold text-(--color-navy)",
            "transition-all duration-150 ease-out hover:brightness-105 motion-reduce:transition-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold)",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-navy)",
          ].join(" ")}
        >
          Explore MetroPaws membership
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row print:hidden">
        <button
          type="button"
          onClick={onCheckAnother}
          className={[
            "inline-flex min-h-11 items-center justify-center rounded-lg px-6 py-3",
            "border border-(--color-navy) text-sm font-semibold text-(--color-navy)",
            "transition-colors duration-150 ease-out hover:bg-(--color-navy)/5 motion-reduce:transition-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold)",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-cream)",
          ].join(" ")}
        >
          Check another pet
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className={[
            "inline-flex min-h-11 items-center justify-center rounded-lg px-6 py-3",
            "border border-(--color-navy) text-sm font-semibold text-(--color-navy)",
            "transition-colors duration-150 ease-out hover:bg-(--color-navy)/5 motion-reduce:transition-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold)",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-cream)",
          ].join(" ")}
        >
          Print or save as PDF
        </button>
      </div>

      {saveStatus === "queued" ? (
        <p
          role="status"
          className="mt-6 text-sm leading-relaxed text-(--color-ink-muted) print:hidden"
        >
          We will save this as soon as you are back online. Your result stays on
          screen either way.
        </p>
      ) : null}
    </div>
  );
}
