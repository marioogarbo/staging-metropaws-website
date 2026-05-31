import type { Plan } from "@/types/plan";
import { PricingCards } from "@/components/pricing-cards";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://metropaws-backend.onrender.com";

const FALLBACK_PLANS: Plan[] = [
  {
    id: "fallback-standard",
    name: "Standard",
    price: 2999,
    price_monthly: 300,
    tagline: "Essential coverage for your furbaby",
    features: [
      "2 Consultations per year",
      "Annual Vaccines (with deworming and Kennel cough)",
      "15% off on Grooming",
      "10% off on Laboratory",
    ],
    is_featured: false,
    is_active: true,
    sort_order: 0,
  },
  {
    id: "fallback-deluxe",
    name: "Deluxe",
    price: 5999,
    price_monthly: 600,
    tagline: "More care, more coverage for your pet",
    features: [
      "4 Consultations per year",
      "Annual Vaccines (with deworming and Kennel cough)",
      "Emergency case/year ONLY: Initial Gate Fee + Basic Stabilization (IV fluids, catheter setup, and immediate pain/anti-inflammatory injections).",
      "10% off on Laboratory",
      "2 Free grooming sessions",
    ],
    is_featured: true,
    is_active: true,
    sort_order: 1,
  },
  {
    id: "fallback-premium",
    name: "Premium",
    price: 10999,
    price_monthly: 1200,
    tagline: "The ultimate MetroPaws experience",
    features: [
      "Unlimited consultations",
      "4 Free grooming sessions",
      "CBC Blood Test (Labs)",
      "Emergency Bridge/year (1st ₱5K covered) plus additional 10% on total bill not exceeding 15K",
      "Annual Vaccines (with deworming and Kennel cough)",
    ],
    is_featured: false,
    is_active: true,
    sort_order: 2,
  },
];

async function fetchPlans(): Promise<Plan[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/plans`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return FALLBACK_PLANS;
    }
    const data = (await response.json()) as Plan[];
    if (!Array.isArray(data) || data.length === 0) {
      return FALLBACK_PLANS;
    }
    return [...data]
      .filter((plan) => plan.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  } catch {
    return FALLBACK_PLANS;
  }
}

export async function PlansSection() {
  const plans = await fetchPlans();

  return (
    <section
      id="pricing"
      className="bg-(--color-cream) py-20 md:py-28"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14 mp-reveal">
          <p className="text-sm font-semibold uppercase tracking-widest text-(--color-gold)">
            Membership
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-(--color-navy) tracking-tight leading-tight mt-3">
            Plans &amp; Pricing
          </h2>
          <p className="text-sm text-(--color-ink-muted) leading-relaxed mt-4 max-w-[52ch]">
            Choose the coverage that fits your pet. No payment to register;
            billing is handled at your partner clinic.
          </p>
        </div>

        <div className="mp-reveal">
          <PricingCards plans={plans} />
        </div>

        <p className="text-sm text-(--color-ink-muted) text-center mt-10 max-w-[60ch] mx-auto leading-relaxed">
          All plans renew annually. Cancel or change tier any time before renewal.
        </p>
      </div>
    </section>
  );
}
