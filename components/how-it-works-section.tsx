import { MapPin, ReceiptText, Wallet } from "lucide-react";

const steps = [
  {
    icon: MapPin,
    title: "Visit any clinic or groomer",
    detail:
      "Stay with the vet your pet already trusts, or pick a MetroPaws partner for added perks. No switching, no lock-in.",
  },
  {
    icon: ReceiptText,
    title: "Pay and upload your receipt",
    detail:
      "Settle the bill as usual, then snap the receipt in the app. We check it against your plan and benefit balance.",
  },
  {
    icon: Wallet,
    title: "Get reimbursed to your wallet",
    detail:
      "Approved wellness benefits and cashback return to your Benefit Wallet, tracked to the peso so you always know what is left.",
  },
];

const walletRows = [
  { label: "Annual Vet Benefit", used: 30 },
  { label: "Grooming Sessions", used: 50 },
  { label: "Lab Savings", used: 15 },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="bg-(--color-cream) py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="mp-reveal max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-(--color-gold)">
            How It Works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-3 text-3xl md:text-5xl font-bold text-(--color-navy) tracking-tight leading-tight"
          >
            Pay your provider. We pay you back.
          </h2>
          <p className="mt-4 text-sm text-(--color-ink-muted) leading-relaxed max-w-[58ch]">
            MetroPaws is a membership, not a discount card. Use your benefits at
            any provider, keep the receipt, and let the app handle the rest.
          </p>
        </div>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map(({ icon: Icon, title, detail }, index) => (
            <li key={title} className="mp-reveal relative flex flex-col">
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold text-(--color-gold) tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-(--color-ink-faint)"
                />
                <Icon
                  className="w-5 h-5 text-(--color-navy)"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-5 text-base font-semibold text-(--color-navy)">
                {title}
              </h3>
              <p className="mt-2 text-sm text-(--color-ink-muted) leading-relaxed">
                {detail}
              </p>
            </li>
          ))}
        </ol>

        {/* Benefit Wallet preview */}
        <div className="mp-reveal mt-16 rounded-xl bg-(--color-navy) p-8 md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
            <div className="shrink-0 lg:max-w-[30ch]">
              <p className="text-sm font-semibold uppercase tracking-widest text-(--color-gold)">
                Benefit Wallet
              </p>
              <h3 className="mt-3 text-xl font-bold text-white leading-tight">
                Every benefit, tracked in one place
              </h3>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">
                See what is available, pending, and used across the year. No
                guessing what is covered before your next visit.
              </p>
            </div>

            <div className="flex-1 flex flex-col gap-5">
              {walletRows.map(({ label, used }) => (
                <div key={label}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium text-white">
                      {label}
                    </span>
                    <span className="text-sm text-(--color-gold-muted) tabular-nums">
                      {used}% used
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-(--color-gold)"
                      style={{ width: `${used}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-white/45 leading-relaxed">
                Illustrative balances. Actual entitlements depend on your plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
