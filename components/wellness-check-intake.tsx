"use client";

import {
  PET_TYPES,
  SPEND_BRACKETS,
  type PetType,
} from "@/lib/wellness-scoring";
import { cn } from "@/lib/utils";

const PET_TYPE_BLURB: Record<PetType, string> = {
  Dog: "Walks, dental, and vaccination schedules",
  Cat: "Indoor routines, parasite cover, and check-ups",
};

export interface IntakeErrors {
  petName: string | null;
  petType: string | null;
}

interface WellnessCheckIntakeProps {
  petName: string;
  petType: PetType | null;
  annualSpend: string;
  errors: IntakeErrors;
  onChange: (patch: {
    petName?: string;
    petType?: PetType;
    annualSpend?: string;
  }) => void;
  onStart: () => void;
}

/**
 * Stage zero: who the check is about.
 *
 * Pet type is two large targets with no typing. The prototype defaulted a
 * <select> to Dog, which would have skewed the species split in the
 * consolidated data toward whatever happened to be first in the list.
 *
 * Name and type are both required (Mario, 2026-09-12). Only the spending
 * estimate stays optional, because it is the one field a stranger has a real
 * reason to refuse and it is worth less than the rest.
 */
export function WellnessCheckIntake({
  petName,
  petType,
  annualSpend,
  errors,
  onChange,
  onStart,
}: WellnessCheckIntakeProps) {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onStart();
      }}
      className="rounded-xl border border-(--color-ink-faint) bg-(--color-surface) p-6 md:p-8"
    >
      <fieldset className="m-0 border-0 p-0">
        <legend className="text-xl md:text-2xl font-bold text-(--color-navy) tracking-tight leading-tight text-balance">
          Who are we checking today?
        </legend>

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          {PET_TYPES.map((type) => (
            <label
              key={type}
              className={cn(
                "group flex min-h-24 cursor-pointer touch-manipulation flex-col justify-center rounded-xl border px-4 py-4",
                "transition-colors duration-150 ease-out motion-reduce:transition-none",
                "border-(--color-ink-faint) bg-(--color-cream) hover:border-(--color-navy)",
                "has-[:checked]:border-(--color-navy) has-[:checked]:bg-(--color-navy)",
                "has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2",
                "has-[:focus-visible]:ring-(--color-gold) has-[:focus-visible]:ring-offset-2",
                "has-[:focus-visible]:ring-offset-(--color-surface)",
              )}
            >
              <input
                type="radio"
                name="petType"
                value={type}
                checked={petType === type}
                onChange={() => onChange({ petType: type })}
                aria-describedby={errors.petType ? "pet-type-error" : undefined}
                className="sr-only"
              />
              <span className="text-base font-bold text-(--color-navy) group-has-[:checked]:text-(--color-surface)">
                {type}
              </span>
              <span className="mt-1 text-sm leading-relaxed text-(--color-ink-muted) group-has-[:checked]:text-(--color-silver)">
                {PET_TYPE_BLURB[type]}
              </span>
            </label>
          ))}
        </div>

        {errors.petType ? (
          <p
            id="pet-type-error"
            role="alert"
            className="mt-4 text-sm font-medium text-(--color-destructive)"
          >
            {errors.petType}
          </p>
        ) : null}

        <div className="mt-6">
          <label
            htmlFor="petName"
            className="block text-sm font-semibold text-(--color-navy)"
          >
            Pet name
          </label>
          <input
            id="petName"
            type="text"
            value={petName}
            maxLength={24}
            autoComplete="off"
            placeholder="Bantay"
            aria-invalid={Boolean(errors.petName)}
            aria-describedby={
              errors.petName ? "pet-name-error" : "pet-name-hint"
            }
            onChange={(event) => onChange({ petName: event.target.value })}
            className={[
              "mt-2 w-full min-h-11 rounded-lg border bg-(--color-cream)",
              "px-3 py-3 text-sm text-(--color-ink) leading-normal",
              "placeholder:text-(--color-ink-faint)",
              "focus:outline-none focus:ring-2 focus:ring-(--color-gold) focus:border-transparent",
              "transition-colors duration-150 ease-out motion-reduce:transition-none",
              errors.petName
                ? "border-(--color-destructive)"
                : "border-(--color-ink-faint)",
            ].join(" ")}
          />
          {errors.petName ? (
            <p
              id="pet-name-error"
              role="alert"
              className="mt-2 text-sm font-medium text-(--color-destructive)"
            >
              {errors.petName}
            </p>
          ) : (
            <p
              id="pet-name-hint"
              className="mt-2 text-sm text-(--color-ink-muted) leading-relaxed"
            >
              We use it to personalise the questions and your result.
            </p>
          )}
        </div>

        {/* Folded, and away from the contact step on purpose: next to a contact
            form a money question reads as qualification for a sales call. Here
            it reads as context. */}
        <details className="group mt-6 border-t border-(--color-ink-faint) pt-5">
          <summary
            className={[
              "list-none [&::-webkit-details-marker]:hidden",
              "flex min-h-11 cursor-pointer items-center rounded-xs text-sm font-semibold text-(--color-navy)",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold)",
            ].join(" ")}
          >
            Add a spending estimate (optional)
          </summary>
          <label
            htmlFor="annualSpend"
            className="mt-3 block text-sm text-(--color-ink-muted) leading-relaxed"
          >
            Roughly what do you spend on routine pet wellness each year?
          </label>
          <select
            id="annualSpend"
            value={annualSpend}
            onChange={(event) => onChange({ annualSpend: event.target.value })}
            className={[
              "mt-2 w-full min-h-11 rounded-lg border border-(--color-ink-faint) bg-(--color-cream)",
              "px-3 py-3 text-sm text-(--color-ink) leading-normal",
              "focus:outline-none focus:ring-2 focus:ring-(--color-gold) focus:border-transparent",
            ].join(" ")}
          >
            <option value="">Select an amount</option>
            {SPEND_BRACKETS.map((bracket) => (
              <option key={bracket} value={bracket}>
                {bracket}
              </option>
            ))}
          </select>
        </details>
      </fieldset>

      <button
        type="submit"
        className={[
          "mt-8 inline-flex w-full min-h-11 items-center justify-center rounded-lg sm:w-auto",
          "bg-(--color-gold) px-6 py-3 text-sm font-semibold text-(--color-navy)",
          "transition-all duration-150 ease-out hover:brightness-105 motion-reduce:transition-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold)",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-surface)",
        ].join(" ")}
      >
        Start the check
      </button>
    </form>
  );
}
