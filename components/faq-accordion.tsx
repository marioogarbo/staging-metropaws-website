"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Faq } from "@/types/faq";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <dl>
      {faqs.map((faq, index) => {
        const isOpen = openIds.has(faq.id);
        return (
          <div
            key={faq.id}
            className={cn(
              "border-t border-white/10",
              index === faqs.length - 1 && "border-b border-b-white/10"
            )}
          >
            <dt>
              <button
                onClick={() => toggle(faq.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-sm font-semibold text-white transition-colors duration-150 ease-out hover:text-(--color-gold) focus-visible:outline-none focus-visible:text-(--color-gold)"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-(--color-gold) transition-transform duration-200 ease-out",
                    isOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>
            </dt>
            {isOpen && (
              <dd className="pb-6 text-sm text-white/60 leading-relaxed max-w-[65ch]">
                {faq.answer}
              </dd>
            )}
          </div>
        );
      })}
    </dl>
  );
}
