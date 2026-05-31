import type { Faq } from "@/types/faq";
import { FaqAccordion } from "@/components/faq-accordion";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://metropaws-backend.onrender.com";

const FALLBACK_FAQS: Faq[] = [
  {
    id: "fallback-1",
    question: "Is MetroPaws free?",
    answer:
      "The app is completely free to download and use. Membership fees, if applicable, are arranged directly with your partner clinic — MetroPaws never charges you through the app.",
    sort_order: 0,
    is_published: true,
  },
  {
    id: "fallback-2",
    question: "What exactly is a session?",
    answer:
      "A session is one service visit — a grooming appointment, a vet consultation, a vaccination, or any other service your clinic offers. Your membership includes a set number of sessions per service type, and the app always shows you exactly how many you have left before your next visit.",
    sort_order: 1,
    is_published: true,
  },
  {
    id: "fallback-3",
    question: "Can I manage multiple pets?",
    answer:
      "Yes. Add as many pets as your household has — dogs, cats, or both. Each pet gets their own Digital Pawprint, session tracker, and vaccination record, all under one account.",
    sort_order: 2,
    is_published: true,
  },
  {
    id: "fallback-4",
    question: "Which clinics in Metro Manila accept MetroPaws?",
    answer:
      "We partner with veterinary clinics across Metro Manila — Quezon City, Makati, Pasig, and more. The full up-to-date list of partner clinics is inside the app once you sign in.",
    sort_order: 3,
    is_published: true,
  },
  {
    id: "fallback-5",
    question: "Does my QR code work without internet?",
    answer:
      "Yes. Your Digital Pawprint QR ID is cached on your phone and works offline. You only need an internet connection to sync new sessions or update your pet's profile.",
    sort_order: 4,
    is_published: true,
  },
];

async function fetchFaqs(): Promise<Faq[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/faqs`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return FALLBACK_FAQS;
    }
    const data = (await response.json()) as Faq[];
    if (!Array.isArray(data) || data.length === 0) {
      return FALLBACK_FAQS;
    }
    return [...data].sort((a, b) => a.sort_order - b.sort_order);
  } catch {
    return FALLBACK_FAQS;
  }
}

export async function FaqSection() {
  const faqs = await fetchFaqs();

  return (
    <section id="faq" className="bg-(--color-navy) py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase tracking-widest text-(--color-gold)">
              Questions
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mt-3">
              Everything you need to know
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mt-4 max-w-[42ch]">
              How the membership works, what sessions cover, and what to expect
              at your first visit.
            </p>
          </div>

          <FaqAccordion faqs={faqs} />
        </div>
      </div>
    </section>
  );
}
