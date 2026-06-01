import type { Faq } from "@/types/faq";
import { FaqAccordion } from "@/components/faq-accordion";
import { Phone, Mail } from "lucide-react";
import Link from "next/link";

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
    <section id="faq" className="bg-(--color-cream-warm) py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold uppercase tracking-widest text-(--color-gold)">
              Questions
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-(--color-navy) tracking-tight leading-tight mt-3">
              Everything you need to know
            </h2>
            <p className="text-sm text-(--color-ink) leading-relaxed mt-4 max-w-[42ch]">
              How the membership works, what sessions cover, and what to expect
              at your first visit.
            </p>
          </div>

          <FaqAccordion faqs={faqs} />
        </div>

        <div id="contact" className="mt-16 pt-10 border-t border-(--color-ink-faint)">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <p className="text-sm text-(--color-ink-muted)">
              Still have a question? We&apos;re easy to reach.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <Link
                href="tel:09209224486"
                className="flex items-center gap-2 text-sm font-medium text-(--color-ink) hover:text-(--color-navy) transition-colors group"
              >
                <Phone className="w-4 h-4 text-(--color-ink-faint) group-hover:text-(--color-navy) transition-colors shrink-0" />
                0920-922-4486
              </Link>
              <Link
                href="mailto:csr@metropaws.ph"
                className="flex items-center gap-2 text-sm font-medium text-(--color-ink) hover:text-(--color-navy) transition-colors group"
              >
                <Mail className="w-4 h-4 text-(--color-ink-faint) group-hover:text-(--color-navy) transition-colors shrink-0" />
                csr@metropaws.ph
              </Link>
              <Link
                href="https://www.facebook.com/people/Metropaws/61588899502470/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-(--color-ink) hover:text-(--color-navy) transition-colors group"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-(--color-ink-faint) group-hover:text-(--color-navy) transition-colors shrink-0"
                  aria-hidden="true"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                Message us on Facebook
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
