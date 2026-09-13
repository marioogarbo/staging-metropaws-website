"use client";

import { Fragment, useDeferredValue, useMemo, useState } from "react";
import { ChevronDown, ClipboardList, Search } from "lucide-react";
import type { WellnessCheck } from "@/app/admin/(protected)/wellness-checks/page";
import {
  EXPO_SOURCE,
  WELLNESS_AREAS,
  maxPointsFor,
  type AnswerSlug,
  type AreaKey,
} from "@/lib/wellness-scoring";
import { cn } from "@/lib/utils";

type SourceFilter = "all" | "expo" | "website";

const SOURCE_LABEL: Record<SourceFilter, string> = {
  all: "All",
  expo: "Expo",
  website: "Website",
};

const COLUMNS = [
  "Pet",
  "Score",
  "Band",
  "Contact",
  "Consent",
  "Source",
  "Submitted",
  "",
];

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-PH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Stored as a 10-digit local number; shown the way people write it. */
function formatPhone(phone: string): string {
  if (phone.length !== 10) return phone;
  return `0${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
}

function answerLabel(key: AreaKey, slug: AnswerSlug | undefined): string {
  const area = WELLNESS_AREAS.find((candidate) => candidate.key === key);
  const option = area?.options.find((candidate) => candidate.value === slug);
  return option?.label ?? "Not answered";
}

interface FilterTabProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function FilterTab({ label, count, active, onClick }: FilterTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.115_82)]",
        active
          ? "bg-[oklch(0.24_0.055_258)] text-[oklch(0.99_0.005_80)]"
          : "text-[oklch(0.40_0.025_258)] hover:bg-[oklch(0.95_0.008_258)]",
      )}
    >
      {label}
      <span className="tabular-nums opacity-70">{count}</span>
    </button>
  );
}

function AnswerBreakdown({ check }: { check: WellnessCheck }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
      {WELLNESS_AREAS.map((area) => (
        <div key={area.key} className="flex items-baseline justify-between gap-4">
          <dt className="text-xs text-[oklch(0.55_0.018_258)]">
            {area.shortLabel}
          </dt>
          <dd className="text-right text-xs text-[oklch(0.24_0.055_258)]">
            {answerLabel(area.key, check.answers[area.key] as AnswerSlug | undefined)}{" "}
            <span className="font-semibold tabular-nums">
              {check.area_scores[area.key] ?? 0}/{maxPointsFor(area)}
            </span>
          </dd>
        </div>
      ))}
      {check.annual_spend_bracket ? (
        <div className="flex items-baseline justify-between gap-4 md:col-span-2">
          <dt className="text-xs text-[oklch(0.55_0.018_258)]">
            Annual wellness spend
          </dt>
          <dd className="text-xs text-[oklch(0.24_0.055_258)]">
            {check.annual_spend_bracket}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

export function WellnessChecksTable({ checks }: { checks: WellnessCheck[] }) {
  const [source, setSource] = useState<SourceFilter>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const expoCount = useMemo(
    () => checks.filter((check) => check.source === EXPO_SOURCE).length,
    [checks],
  );

  const filtered = useMemo(() => {
    const needle = deferredSearch.trim().toLowerCase();
    return checks.filter((check) => {
      const isExpo = check.source === EXPO_SOURCE;
      if (source === "expo" && !isExpo) return false;
      if (source === "website" && isExpo) return false;
      if (!needle) return true;
      return [
        check.pet_name,
        check.owner_name,
        check.contact_email,
        check.contact_phone,
        check.band,
      ].some((field) => field?.toLowerCase().includes(needle));
    });
  }, [checks, source, deferredSearch]);

  function countFor(option: SourceFilter): number {
    if (option === "all") return checks.length;
    if (option === "expo") return expoCount;
    return checks.length - expoCount;
  }

  return (
    <div className="rounded-xl border border-[oklch(0.88_0.010_258)] overflow-hidden bg-[oklch(0.99_0.005_80)]">
      <div className="flex flex-col gap-3 border-b border-[oklch(0.92_0.010_258)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {(["all", "expo", "website"] as const).map((option) => (
            <FilterTab
              key={option}
              label={SOURCE_LABEL[option]}
              count={countFor(option)}
              active={source === option}
              onClick={() => setSource(option)}
            />
          ))}
        </div>
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[oklch(0.62_0.015_258)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search pet, owner, contact"
            aria-label="Search wellness checks"
            className={[
              "w-full min-h-9 rounded-lg border border-[oklch(0.91_0.010_258)] bg-[oklch(0.99_0.005_80)]",
              "py-2 pl-8 pr-3 text-xs text-[oklch(0.24_0.055_258)] sm:w-64",
              "focus:outline-none focus:ring-2 focus:ring-[oklch(0.72_0.115_82)]",
            ].join(" ")}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[oklch(0.95_0.008_258)]">
            <ClipboardList size={18} className="text-[oklch(0.55_0.018_258)]" />
          </div>
          <p className="mt-4 text-sm font-semibold text-[oklch(0.24_0.055_258)]">
            {checks.length === 0 ? "No wellness checks yet" : "No results found"}
          </p>
          <p className="mt-1 text-xs text-[oklch(0.55_0.018_258)]">
            {checks.length === 0
              ? "Submissions from the website and the expo booth land here."
              : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[oklch(0.89_0.014_258)] bg-[oklch(0.94_0.013_258)]">
                {COLUMNS.map((heading, index) => (
                  <th
                    key={heading || `actions-${index}`}
                    scope="col"
                    className="px-4 py-3 text-[oklch(0.40_0.025_258)] text-xs font-semibold uppercase tracking-wider"
                  >
                    {heading || <span className="sr-only">Answers</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((check) => {
                const isOpen = expanded === check.id;
                const contact = check.contact_phone
                  ? formatPhone(check.contact_phone)
                  : check.contact_email;
                return (
                  <Fragment key={check.id}>
                    <tr
                      className="border-b border-[oklch(0.92_0.010_258)] hover:bg-[oklch(0.98_0.006_80)] transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold text-[oklch(0.24_0.055_258)]">
                          {check.pet_name || "Unnamed"}
                        </p>
                        <p className="text-xs text-[oklch(0.55_0.018_258)]">
                          {check.pet_type}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-bold tabular-nums text-[oklch(0.24_0.055_258)]">
                        {check.total_score}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[oklch(0.40_0.025_258)]">
                        {check.band}
                      </td>
                      <td className="px-4 py-3.5">
                        {/* A dash, not an empty cell: "we did not collect it"
                            must look different from "we failed to show it". */}
                        <p className="text-xs text-[oklch(0.40_0.025_258)]">
                          {contact || "—"}
                        </p>
                        {check.owner_name ? (
                          <p className="text-xs text-[oklch(0.55_0.018_258)]">
                            {check.owner_name}
                          </p>
                        ) : null}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3.5 text-xs font-semibold",
                          check.consent_given
                            ? "text-[oklch(0.24_0.055_258)]"
                            : "text-[oklch(0.62_0.015_258)]",
                        )}
                      >
                        {check.consent_given ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[oklch(0.55_0.018_258)]">
                        {check.source === EXPO_SOURCE ? "Expo" : "Website"}
                      </td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap text-[oklch(0.55_0.018_258)]">
                        {formatDate(check.created_at)}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : check.id)}
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? "Hide" : "Show"} answers for ${check.pet_name || "this pet"}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[oklch(0.40_0.025_258)] hover:bg-[oklch(0.95_0.008_258)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.115_82)]"
                        >
                          <ChevronDown
                            size={15}
                            className={cn(
                              "transition-transform duration-200 ease-out motion-reduce:transition-none",
                              isOpen && "rotate-180",
                            )}
                          />
                        </button>
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr
                        className="border-b border-[oklch(0.92_0.010_258)] bg-[oklch(0.98_0.006_80)]"
                      >
                        <td colSpan={COLUMNS.length} className="px-4 py-4">
                          <AnswerBreakdown check={check} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-[oklch(0.92_0.010_258)] px-4 py-3">
        <p className="text-xs text-[oklch(0.55_0.018_258)]">
          Showing {filtered.length} of {checks.length} wellness checks
        </p>
      </div>
    </div>
  );
}
