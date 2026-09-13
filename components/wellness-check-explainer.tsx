import { WELLNESS_AREAS, maxPointsFor } from "@/lib/wellness-scoring";

/**
 * The eight areas as prose, below the check.
 *
 * The questions themselves live in a stepped flow, so seven of the eight are
 * hidden at any moment. This section is what a search engine and a skimmer
 * actually read, and it is honest marketing copy in its own right rather than
 * a keyword shim.
 */
export function WellnessCheckExplainer() {
  return (
    <section className="bg-(--color-cream-warm) py-20 md:py-28 print:hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mp-reveal max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-(--color-gold-deep)">
            What we look at
          </p>
          <h2 className="mt-3 text-2xl md:text-3xl font-bold text-(--color-navy) tracking-tight leading-tight text-balance">
            Eight areas of preventive care
          </h2>
          <p className="mt-4 text-sm text-(--color-ink-muted) leading-relaxed max-w-[62ch]">
            Each area is worth a share of 100 points, weighted by how much it
            shapes a pet&rsquo;s year. Vaccination, preventive vet visits and
            parasite cover carry the most, because they are the ones that turn
            into an emergency when they slip.
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
          {WELLNESS_AREAS.map((area) => (
            <div
              key={area.key}
              className="border-t border-(--color-ink-faint) pt-5"
            >
              <dt className="flex items-baseline justify-between gap-4">
                <span className="text-base font-semibold text-(--color-navy)">
                  {area.shortLabel}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-(--color-ink-muted)">
                  {maxPointsFor(area)} pts
                </span>
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-(--color-ink-muted)">
                {area.planDetail}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
