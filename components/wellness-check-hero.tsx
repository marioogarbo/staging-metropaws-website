import { ChevronDown, Info } from "lucide-react";

/**
 * The disclaimer sits in the hero, folded, before anyone answers anything.
 *
 * Same reasoning as the directory hero: putting it here means it is read in the
 * same breath as the promise rather than discovered afterwards in small print.
 * Native <details> needs no JavaScript, survives a failed hydration, is
 * keyboard-operable for free, and keeps the full text in the DOM for screen
 * readers and for the record.
 */
export function WellnessCheckHero() {
  return (
    <section className="bg-(--color-cream) pt-12 pb-10 md:pt-20 md:pb-14 [@media(max-height:540px)]:pt-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mp-reveal max-w-2xl">
          {/* gold-deep, not gold: --color-gold on cream is about 2.3:1 and
              fails AA at this size and weight. */}
          <p className="text-sm font-semibold uppercase tracking-widest text-(--color-gold-deep)">
            Preventive care check
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold text-(--color-navy) tracking-tight leading-tight text-balance">
            Pet Wellness Readiness Check
          </h1>
          <p className="mt-4 text-sm text-(--color-ink-muted) leading-relaxed max-w-[62ch]">
            Eight questions about your pet&rsquo;s routine. It takes about a
            minute, and you get a readiness score out of 100 with a simple
            12-month plan you can print or save.
          </p>
          {/* The contact step is required, so it is named here rather than
              sprung after the last question. A disclosed exchange is fair; the
              same gate undisclosed is what makes a booth visitor feel had. */}
          <p className="mt-3 text-sm text-(--color-ink-muted) leading-relaxed max-w-[62ch]">
            You will be asked for your name and a mobile number or email at the
            end, so our team can follow up on your result.
          </p>

          <details className="group mt-6 max-w-2xl border-t border-(--color-ink-faint) pt-5">
            <summary
              className={[
                "list-none [&::-webkit-details-marker]:hidden",
                "flex cursor-pointer items-start gap-2.5 rounded-xs",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold)",
              ].join(" ")}
            >
              <Info
                size={16}
                className="mt-0.5 shrink-0 text-(--color-navy)"
                aria-hidden="true"
              />
              <p className="min-w-0 flex-1 text-sm leading-relaxed text-(--color-ink-muted)">
                <strong className="font-semibold text-(--color-navy)">
                  This is a readiness check, not a veterinary examination.
                </strong>{" "}
                It cannot diagnose anything.
              </p>
              <ChevronDown
                size={16}
                className="mt-0.5 shrink-0 text-(--color-ink-muted) transition-transform duration-200 ease-out group-open:rotate-180 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 pl-6.5 text-sm leading-relaxed text-(--color-ink-muted)">
              The score reflects only the eight answers you give. It is not a
              diagnosis, a treatment plan, or veterinary advice, and it does not
              replace a consultation with a licensed veterinarian. If your pet
              is unwell, see a vet.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
