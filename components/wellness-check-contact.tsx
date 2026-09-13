"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export type ContactChannel = "mobile" | "email";

export interface ContactDetails {
  ownerName: string;
  channel: ContactChannel;
  contact: string;
  consentGiven: boolean;
}

export interface ContactErrors {
  ownerName: string | null;
  contact: string | null;
}

interface WellnessCheckContactProps {
  displayName: string;
  details: ContactDetails;
  errors: ContactErrors;
  onChange: (patch: Partial<ContactDetails>) => void;
  onSubmit: () => void;
}

const CHANNEL_LABEL: Record<ContactChannel, string> = {
  mobile: "Mobile",
  email: "Email",
};

/**
 * The last step before the score. Required, by Mario's call 2026-09-12.
 *
 * A required contact field is a toll gate, and a toll gate sprung after the
 * effort is the thing a stranger at a booth resents. The mitigation is not to
 * soften this screen, it is to say so on the hero before anyone starts: a
 * disclosed exchange is fair, an undisclosed one is a trap. The hero copy and
 * this step have to keep telling the same story.
 *
 * The copy promises a callback and nothing else. MetroPaws cannot send email at
 * the moment and has no SMS path, so "we will text you the plan" would be a
 * promise we could not keep. The takeaway the visitor gets is the PDF.
 */
export function WellnessCheckContact({
  displayName,
  details,
  errors,
  onChange,
  onSubmit,
}: WellnessCheckContactProps) {
  const groupId = useId();
  const contactId = `${groupId}-contact`;
  const isMobile = details.channel === "mobile";

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="rounded-xl border border-(--color-ink-faint) bg-(--color-surface) p-6 md:p-8"
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-(--color-gold-deep)">
        Last step
      </p>
      <h2 className="mt-3 text-xl md:text-2xl font-bold text-(--color-navy) tracking-tight leading-tight text-balance">
        Where can we reach you about {displayName}&rsquo;s plan?
      </h2>
      <p className="mt-4 text-sm text-(--color-ink-muted) leading-relaxed max-w-[58ch]">
        Someone from MetroPaws will follow up about the areas worth
        strengthening and what membership covers. Then your score and your
        12-month plan appear, and you can print or save them.
      </p>

      <div className="mt-6">
        <label
          htmlFor={`${groupId}-owner`}
          className="block text-sm font-semibold text-(--color-navy)"
        >
          Your name
        </label>
        <input
          id={`${groupId}-owner`}
          type="text"
          value={details.ownerName}
          maxLength={80}
          autoComplete="name"
          aria-invalid={Boolean(errors.ownerName)}
          aria-describedby={
            errors.ownerName ? `${groupId}-owner-error` : undefined
          }
          onChange={(event) => onChange({ ownerName: event.target.value })}
          className={[
            "mt-2 w-full min-h-11 rounded-lg border bg-(--color-cream)",
            "px-3 py-3 text-sm text-(--color-ink) leading-normal",
            "placeholder:text-(--color-ink-faint)",
            "focus:outline-none focus:ring-2 focus:ring-(--color-gold) focus:border-transparent",
            errors.ownerName
              ? "border-(--color-destructive)"
              : "border-(--color-ink-faint)",
          ].join(" ")}
        />
        {errors.ownerName ? (
          <p
            id={`${groupId}-owner-error`}
            role="alert"
            className="mt-2 text-sm font-medium text-(--color-destructive)"
          >
            {errors.ownerName}
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        {/* One field, not two. A mobile keyboard in a noisy hall makes typing an
            email painful, and asking for both is two fields where one will do. */}
        <div
          role="radiogroup"
          aria-label="How we should reach you"
          className="relative inline-grid grid-cols-2 items-center rounded-full border border-(--color-ink-faint) bg-(--color-cream) p-1"
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-1 left-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-full bg-(--color-navy)",
              "transition-transform duration-200 ease-out motion-reduce:transition-none",
              !isMobile && "translate-x-full",
            )}
          />
          {(["mobile", "email"] as const).map((channel) => {
            const active = details.channel === channel;
            return (
              <button
                key={channel}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => onChange({ channel })}
                className={cn(
                  "relative z-10 min-h-11 rounded-full px-5 text-sm font-semibold",
                  "transition-colors duration-150 ease-out motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold)",
                  active
                    ? "text-(--color-surface)"
                    : "text-(--color-ink-muted)",
                )}
              >
                {CHANNEL_LABEL[channel]}
              </button>
            );
          })}
        </div>

        <label htmlFor={contactId} className="sr-only">
          {isMobile ? "Mobile number" : "Email address"}
        </label>
        <input
          id={contactId}
          type={isMobile ? "tel" : "email"}
          inputMode={isMobile ? "tel" : "email"}
          autoComplete={isMobile ? "tel" : "email"}
          value={details.contact}
          maxLength={isMobile ? 20 : 254}
          placeholder={isMobile ? "0917 123 4567" : "you@example.com"}
          aria-invalid={Boolean(errors.contact)}
          aria-describedby={errors.contact ? `${contactId}-error` : undefined}
          onChange={(event) => onChange({ contact: event.target.value })}
          className={[
            "mt-3 w-full min-h-11 rounded-lg border bg-(--color-cream)",
            "px-3 py-3 text-sm text-(--color-ink) leading-normal",
            "placeholder:text-(--color-ink-faint)",
            "focus:outline-none focus:ring-2 focus:ring-(--color-gold) focus:border-transparent",
            errors.contact
              ? "border-(--color-destructive)"
              : "border-(--color-ink-faint)",
          ].join(" ")}
        />
        {errors.contact ? (
          <p
            id={`${contactId}-error`}
            role="alert"
            className="mt-2 text-sm font-medium text-(--color-destructive)"
          >
            {errors.contact}
          </p>
        ) : null}
      </div>

      {/* The 16px box is under the 44px floor, so the wrapping label is the
          real target. Never pre-ticked: consent has to be freely given. */}
      <label className="mt-5 flex min-h-11 cursor-pointer items-start gap-3 py-2">
        <input
          type="checkbox"
          checked={details.consentGiven}
          onChange={(event) => onChange({ consentGiven: event.target.checked })}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-(--color-gold)"
        />
        <span className="text-sm leading-relaxed text-(--color-ink-muted)">
          MetroPaws may contact me about this result and about membership. See
          the{" "}
          <a
            href="/privacy-policy"
            className="font-semibold text-(--color-navy) underline underline-offset-4"
          >
            Privacy Policy
          </a>
          .
        </span>
      </label>
      <p className="mt-3 text-sm leading-relaxed text-(--color-ink-muted)">
        Your details are saved with your result either way. The box above is
        optional, and it is your permission for us to talk to you about
        membership as well as about this check.
      </p>

      <button
        type="submit"
        className={[
          "mt-6 inline-flex w-full min-h-11 items-center justify-center rounded-lg",
          "bg-(--color-gold) px-6 py-3 text-sm font-semibold text-(--color-navy)",
          "transition-all duration-150 ease-out hover:brightness-105 motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold)",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-surface)",
        ].join(" ")}
      >
        Show my score
      </button>
    </form>
  );
}
