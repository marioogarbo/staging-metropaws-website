"use client";

import { useEffect, useRef } from "react";
import {
  WELLNESS_AREAS,
  fillPetName,
  type AnswerSlug,
  type Answers,
  type AreaKey,
} from "@/lib/wellness-scoring";
import { cn } from "@/lib/utils";

interface WellnessCheckQuestionProps {
  index: number;
  answers: Answers;
  displayName: string;
  petType: string;
  error: string | null;
  onAnswer: (key: AreaKey, slug: AnswerSlug) => void;
  onBack: () => void;
  onNext: () => void;
  onJumpTo: (index: number) => void;
}

/**
 * One question at a time, with every fieldset kept in the DOM.
 *
 * Hidden rather than unmounted so the native radio groups keep their identity
 * across steps and the content stays crawlable. The rail on the left at lg is
 * what stops a focused single question reading as an empty lead funnel on a
 * wide screen: the same state machine, two layouts.
 */
export function WellnessCheckQuestion({
  index,
  answers,
  displayName,
  petType,
  error,
  onAnswer,
  onBack,
  onNext,
  onJumpTo,
}: WellnessCheckQuestionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerSelection = useRef(false);
  // A timer started inside an event handler captures the props from the render
  // it was scheduled in. The answer that handler just recorded only lands in
  // the NEXT render, so a captured onNext still sees the question as
  // unanswered and refuses to advance. Call whichever one is current when the
  // timer actually fires instead.
  const latestNext = useRef(onNext);
  const previousIndex = useRef(index);
  const goingBack = index < previousIndex.current;

  // Move focus to the card on each step so a screen reader reads the new
  // question rather than staying on a button that is now about something else.
  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
  }, [index]);

  useEffect(() => {
    latestNext.current = onNext;
  });

  useEffect(() => {
    previousIndex.current = index;
  }, [index]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  function handleSelect(key: AreaKey, slug: AnswerSlug) {
    // Cleared on every selection, so changing your mind inside the window works.
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    onAnswer(key, slug);
    // Auto-advance only when a finger or a mouse made the choice. Arrow keys
    // move selection through a native radio group, so advancing on every
    // change would yank a keyboard user past questions they are still reading.
    if (!pointerSelection.current) return;
    advanceTimer.current = setTimeout(() => latestNext.current(), 220);
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-12">
      <ol className="hidden lg:block" aria-label="Questions">
        {WELLNESS_AREAS.map((area, position) => {
          const isAnswered = Boolean(answers[area.key]);
          const isCurrent = position === index;
          const reachable = isAnswered || position < index;
          return (
            <li key={area.key} className="flex items-center gap-3 py-2">
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                  "transition-colors duration-200 ease-out motion-reduce:transition-none",
                  isCurrent
                    ? "border border-(--color-navy) text-(--color-navy)"
                    : isAnswered
                      ? "bg-(--color-navy) text-(--color-surface)"
                      : "border border-(--color-ink-faint) text-(--color-ink-faint)",
                )}
              >
                {position + 1}
              </span>
              {reachable && !isCurrent ? (
                <button
                  type="button"
                  onClick={() => onJumpTo(position)}
                  className={[
                    "min-h-11 flex-1 text-left text-sm text-(--color-ink-muted)",
                    "hover:text-(--color-navy) transition-colors duration-150 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold) rounded-xs",
                  ].join(" ")}
                >
                  {area.shortLabel}
                </button>
              ) : (
                <span
                  className={cn(
                    "flex-1 text-sm",
                    isCurrent
                      ? "font-semibold text-(--color-navy)"
                      : "text-(--color-ink-faint)",
                  )}
                >
                  {area.shortLabel}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Navy card, not cream. On cream an unselected option is a 1.02:1 fill
          difference from the page with a faint border, which is three
          near-invisible boundaries at arm's length in a noisy hall. Inverting
          the selected option against navy is about 16:1. */}
      <div
        ref={cardRef}
        tabIndex={-1}
        className="rounded-xl bg-(--color-navy) p-6 md:p-8 focus:outline-none"
      >
        <div className="flex items-center justify-between gap-4">
          <p
            role="status"
            aria-live="polite"
            className="text-sm font-semibold tabular-nums text-(--color-surface)"
          >
            Question {index + 1}{" "}
            <span className="font-normal text-white/55">
              of {WELLNESS_AREAS.length}
            </span>
          </p>
          <p
            className="max-w-[16ch] truncate text-sm text-(--color-silver)"
            title={displayName}
          >
            {displayName} &middot; {petType}
          </p>
        </div>

        {/* Segments, not a bar: "two left" reads better from a distance than
            "75%", and a percentage part-way through just looks discouraging. */}
        <div aria-hidden="true" className="mt-3 flex gap-1 lg:hidden">
          {WELLNESS_AREAS.map((area, position) => (
            <span
              key={area.key}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                "transition-colors duration-200 ease-out motion-reduce:transition-none",
                answers[area.key]
                  ? "bg-(--color-surface)"
                  : position === index
                    ? "bg-white/45"
                    : "bg-white/15",
              )}
            />
          ))}
        </div>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (advanceTimer.current) clearTimeout(advanceTimer.current);
            onNext();
          }}
        >
          <div
            key={index}
            className={goingBack ? "mp-step-back" : "mp-step-forward"}
          >
            {WELLNESS_AREAS.map((area, position) => (
              <fieldset
                key={area.key}
                hidden={position !== index}
                className="m-0 border-0 p-0"
              >
                <legend className="mt-6 text-xl md:text-2xl font-bold text-(--color-surface) tracking-tight leading-tight text-balance">
                  {fillPetName(area.prompt, displayName)}
                </legend>

                {area.note ? (
                  <p className="mt-3 text-sm leading-relaxed text-(--color-silver)">
                    {area.note}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-col gap-2.5">
                  {area.options.map((option) => (
                    <label
                      key={option.value}
                      onPointerDown={() => {
                        pointerSelection.current = true;
                      }}
                      onPointerUp={() => {
                        // Reset after the change handler has run.
                        setTimeout(() => {
                          pointerSelection.current = false;
                        }, 0);
                      }}
                      className={[
                        "group relative flex min-h-14 cursor-pointer touch-manipulation items-center gap-3",
                        "rounded-xl border px-4 py-4",
                        "border-white/15 bg-(--color-navy-mid) text-white/85",
                        "transition-colors duration-150 ease-out motion-reduce:transition-none",
                        "hover:border-white/40 active:bg-white/10",
                        "has-[:checked]:border-(--color-surface) has-[:checked]:bg-(--color-surface) has-[:checked]:text-(--color-navy)",
                        "has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2",
                        "has-[:focus-visible]:ring-(--color-gold) has-[:focus-visible]:ring-offset-2",
                        "has-[:focus-visible]:ring-offset-(--color-navy)",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name={area.key}
                        value={option.value}
                        checked={answers[area.key] === option.value}
                        onChange={() => handleSelect(area.key, option.value)}
                        className="sr-only"
                      />
                      {/* A dot, never a check. Some of these answers are
                        "Overdue or none" and ticking that is a semantic lie. */}
                      <span
                        aria-hidden="true"
                        className={[
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                          "border-white/40 group-has-[:checked]:border-(--color-navy)",
                          "transition-colors duration-150 ease-out motion-reduce:transition-none",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "h-2 w-2 rounded-full bg-(--color-navy)",
                            "scale-0 group-has-[:checked]:scale-100",
                            "transition-transform duration-150 ease-out motion-reduce:transition-none",
                          ].join(" ")}
                        />
                      </span>
                      <span className="text-sm font-medium leading-relaxed">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 text-sm font-medium text-(--color-destructive)"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className={[
                "inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3",
                "border border-white/25 text-sm font-semibold text-(--color-surface)",
                "transition-colors duration-150 ease-out hover:bg-white/10 motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold)",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-navy)",
              ].join(" ")}
            >
              Back
            </button>
            <button
              type="submit"
              className={[
                "inline-flex min-h-11 flex-1 items-center justify-center rounded-lg px-6 py-3 sm:flex-none",
                "bg-(--color-gold) text-sm font-semibold text-(--color-navy)",
                "transition-all duration-150 ease-out hover:brightness-105 motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold)",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-navy)",
              ].join(" ")}
            >
              {index === WELLNESS_AREAS.length - 1 ? "See my score" : "Next"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
