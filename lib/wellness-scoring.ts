/**
 * Scoring rubric for the public Pet Wellness Readiness Check.
 *
 * MIRRORED IN `backend/app/domain/wellness_scoring.py`, which scores the same
 * answers again on submission and stores ITS result, never this one. This copy
 * exists so the visitor sees a score the instant they answer the last question,
 * with no network in the path: at an expo booth on venue wifi, against a Render
 * instance that may be cold, waiting would lose the interaction entirely.
 *
 * Editing the questions, the points, the bands or the advice means editing BOTH
 * files, and the strings must match character for character. The website shows
 * its copy and the server stores its own, so a divergence is a number that
 * exists in one place and not the other. The page reconciles the two after
 * submitting and warns in the console if they disagree.
 *
 * The order of WELLNESS_AREAS is load-bearing: it is the question order, the
 * export column order, and the final tiebreak between two equally weak areas.
 */

export type AnswerSlug = "full" | "partial" | "none";

export type AreaKey =
  | "vaccination"
  | "vet"
  | "parasite"
  | "dental"
  | "grooming"
  | "nutrition"
  | "activity"
  | "records";

export type PetType = "Dog" | "Cat";

export type Answers = Partial<Record<AreaKey, AnswerSlug>>;

export interface WellnessOption {
  value: AnswerSlug;
  label: string;
  points: number;
}

export interface WellnessArea {
  key: AreaKey;
  shortLabel: string;
  /** Carries a `{pet}` placeholder; substitute with fillPetName. */
  prompt: string;
  note: string;
  options: WellnessOption[];
  planTitle: string;
  planDetail: string;
  maintenanceTitle: string;
  maintenanceDetail: string;
}

export interface WellnessBand {
  minimum: number;
  name: string;
  reading: string;
}

export interface RoadmapStep {
  timeframe: string;
  area: string;
  title: string;
  detail: string;
}

export interface AreaBreakdown {
  key: AreaKey;
  shortLabel: string;
  answerLabel: string;
  points: number;
  maxPoints: number;
}

export interface WellnessResult {
  totalScore: number;
  band: WellnessBand;
  areaScores: Record<AreaKey, number>;
  strongAreas: AreaBreakdown[];
  areasToStrengthen: AreaBreakdown[];
  roadmap: RoadmapStep[];
}

export const WELLNESS_AREAS: WellnessArea[] = [
  {
    key: "vaccination",
    shortLabel: "Core vaccinations",
    prompt: "Are {pet}'s core vaccinations current?",
    note: "",
    options: [
      {
        value: "full",
        label: "Yes, current",
        points: 20,
      },
      {
        value: "partial",
        label: "Partly current or not sure",
        points: 10,
      },
      {
        value: "none",
        label: "Overdue or none",
        points: 0,
      },
    ],
    planTitle: "Book a core vaccination review",
    planDetail: "Review vaccination status with a licensed veterinarian and write down the next due date.",
    maintenanceTitle: "Keep the vaccination dates on file",
    maintenanceDetail: "Note the next due date so the schedule does not slip.",
  },
  {
    key: "vet",
    shortLabel: "Preventive vet check",
    prompt: "Has {pet} had a preventive vet check in the last 12 months?",
    note: "",
    options: [
      {
        value: "full",
        label: "Yes",
        points: 15,
      },
      {
        value: "partial",
        label: "More than 12 months ago or not sure",
        points: 5,
      },
      {
        value: "none",
        label: "Never, or no regular preventive check",
        points: 0,
      },
    ],
    planTitle: "Schedule a preventive check",
    planDetail: "Plan a preventive veterinary check and ask what routine schedule suits your pet.",
    maintenanceTitle: "Hold the yearly check",
    maintenanceDetail: "Book the next preventive check before it is due.",
  },
  {
    key: "parasite",
    shortLabel: "Parasite prevention",
    prompt: "Is parasite prevention part of {pet}'s routine?",
    note: "This covers fleas, ticks, and deworming.",
    options: [
      {
        value: "full",
        label: "Yes, regular and current",
        points: 15,
      },
      {
        value: "partial",
        label: "Occasional or not sure",
        points: 7,
      },
      {
        value: "none",
        label: "No routine",
        points: 0,
      },
    ],
    planTitle: "Set a parasite prevention routine",
    planDetail: "Ask your veterinarian which parasite prevention suits your pet, and set reminders for the due dates.",
    maintenanceTitle: "Keep the prevention dates current",
    maintenanceDetail: "Stay on the schedule your veterinarian set.",
  },
  {
    key: "dental",
    shortLabel: "Dental and oral care",
    prompt: "Does {pet} get regular dental or oral care?",
    note: "",
    options: [
      {
        value: "full",
        label: "Yes, regular home or professional care",
        points: 10,
      },
      {
        value: "partial",
        label: "Occasionally",
        points: 5,
      },
      {
        value: "none",
        label: "Rarely or never",
        points: 0,
      },
    ],
    planTitle: "Start a dental routine",
    planDetail: "Add regular oral care at home, and raise dental checks with your veterinarian when appropriate.",
    maintenanceTitle: "Keep the dental routine going",
    maintenanceDetail: "Stay with the home and professional care already in place.",
  },
  {
    key: "grooming",
    shortLabel: "Grooming and hygiene",
    prompt: "Does {pet} have a suitable grooming and hygiene routine?",
    note: "",
    options: [
      {
        value: "full",
        label: "Yes, regular and suitable",
        points: 10,
      },
      {
        value: "partial",
        label: "Irregular",
        points: 5,
      },
      {
        value: "none",
        label: "No routine, or not sure",
        points: 0,
      },
    ],
    planTitle: "Settle a grooming schedule",
    planDetail: "Set a consistent grooming and hygiene routine that suits your pet.",
    maintenanceTitle: "Hold the grooming schedule",
    maintenanceDetail: "Keep the routine at the interval that already works.",
  },
  {
    key: "nutrition",
    shortLabel: "Nutrition",
    prompt: "Is {pet}'s feeding routine consistent and suited to their life stage?",
    note: "",
    options: [
      {
        value: "full",
        label: "Yes",
        points: 10,
      },
      {
        value: "partial",
        label: "Somewhat, or not sure",
        points: 5,
      },
      {
        value: "none",
        label: "No consistent routine",
        points: 0,
      },
    ],
    planTitle: "Review the feeding plan",
    planDetail: "Check that feeding is consistent and that the diet suits your pet's age and needs.",
    maintenanceTitle: "Revisit the diet as they age",
    maintenanceDetail: "Check the diet still suits your pet as their life stage changes.",
  },
  {
    key: "activity",
    shortLabel: "Activity and enrichment",
    prompt: "Does {pet} get regular activity or enrichment for their age?",
    note: "Play, training, and walks all count.",
    options: [
      {
        value: "full",
        label: "Yes, regular",
        points: 10,
      },
      {
        value: "partial",
        label: "Occasional",
        points: 5,
      },
      {
        value: "none",
        label: "Very limited",
        points: 0,
      },
    ],
    planTitle: "Build activity into the week",
    planDetail: "Work regular, age-appropriate exercise and enrichment into the weekly routine.",
    maintenanceTitle: "Keep the weekly activity up",
    maintenanceDetail: "Adjust the activity as your pet's energy changes.",
  },
  {
    key: "records",
    shortLabel: "Records and reminders",
    prompt: "Do you keep wellness records and reminders for {pet}?",
    note: "",
    options: [
      {
        value: "full",
        label: "Yes, organised records with reminders",
        points: 10,
      },
      {
        value: "partial",
        label: "Partial records",
        points: 5,
      },
      {
        value: "none",
        label: "No organised records",
        points: 0,
      },
    ],
    planTitle: "Put the records in one place",
    planDetail: "Organise vaccination, consultation, grooming and preventive-care records, and set reminders for what is next.",
    maintenanceTitle: "Keep the records up to date",
    maintenanceDetail: "Add each visit to the record while it is fresh.",
  },
];

/** Descending, so the first threshold a score clears is its band. */
export const WELLNESS_BANDS: WellnessBand[] = [
  {
    minimum: 85,
    name: "Strong Wellness Routine",
    reading: "Nothing here needs fixing. Keep it on schedule.",
  },
  {
    minimum: 70,
    name: "Good Foundation, Some Areas to Strengthen",
    reading: "The foundation is there. A few areas would benefit from attention.",
  },
  {
    minimum: 50,
    name: "Wellness Planning Recommended",
    reading: "Several parts of the routine are running without a plan behind them.",
  },
  {
    minimum: 0,
    name: "Several Preventive Care Areas Need Attention",
    reading: "Start with the first item below. It carries the most weight.",
  },
];

export const SPEND_BRACKETS = [
  "Below PHP 3,000",
  "PHP 3,000 to PHP 5,999",
  "PHP 6,000 to PHP 9,999",
  "PHP 10,000 to PHP 19,999",
  "PHP 20,000 and above",
  "Rather not say"
] as const;

export const PET_TYPES: PetType[] = ["Dog", "Cat"];

export const ROADMAP_TIMEFRAMES = ["Next 30 days", "Next 3 months", "Within 12 months"] as const;

export const ROADMAP_LENGTH = ROADMAP_TIMEFRAMES.length;

export const CONSENT_TEXT_VERSION = "wellness-check-2026-09";

export const WEBSITE_SOURCE = "website_wellness_check";
export const EXPO_SOURCE = "WPE2026_BOOTH612";

export function maxPointsFor(area: WellnessArea): number {
  return Math.max(...area.options.map((option) => option.points));
}

export const TOTAL_POINTS = WELLNESS_AREAS.reduce(
  (total, area) => total + maxPointsFor(area),
  0,
);

/**
 * Map a `?src=` value onto a stored source.
 *
 * An allowlist rather than a passthrough. The value arrives from a public query
 * string and ends up in a spreadsheet cell, and Excel evaluates text that opens
 * with an equals sign. Anything unrecognised falls back to the website source
 * rather than erroring, so a mistyped QR code still captures the submission.
 */
const SOURCE_BY_SRC_PARAM: Record<string, string> = {
  wpe2026: EXPO_SOURCE,
};

export function resolveSource(src: string | null): string {
  if (!src) return WEBSITE_SOURCE;
  return SOURCE_BY_SRC_PARAM[src.toLowerCase()] ?? WEBSITE_SOURCE;
}

/** "Are {pet}'s vaccinations current?" with a name, or a graceful fallback. */
export function fillPetName(template: string, petName: string): string {
  return template.replace("{pet}", petName.trim() || "your pet");
}

export function bandFor(totalScore: number): WellnessBand {
  const band = WELLNESS_BANDS.find((candidate) => totalScore >= candidate.minimum);
  if (!band) throw new Error(`No band covers a score of ${totalScore}`);
  return band;
}

function optionFor(area: WellnessArea, slug: AnswerSlug): WellnessOption {
  const option = area.options.find((candidate) => candidate.value === slug);
  if (!option) throw new Error(`${area.key} has no option ${slug}`);
  return option;
}

function breakdownFor(area: WellnessArea, slug: AnswerSlug): AreaBreakdown {
  const option = optionFor(area, slug);
  return {
    key: area.key,
    shortLabel: area.shortLabel,
    answerLabel: option.label,
    points: option.points,
    maxPoints: maxPointsFor(area),
  };
}

/**
 * The three weakest areas, worst first, as dated actions.
 *
 * Ties break on the area's weight (a 0/20 vaccination gap outranks a 0/10
 * grooming gap) and then on declaration order, so two people comparing phones
 * at the booth see the same three steps for the same answers.
 *
 * A perfect score still gets three steps, but they switch to maintenance
 * wording. Telling someone who answered everything correctly to go and fix
 * three things is the bug that makes a perfect score feel broken.
 */
function roadmapFor(
  areaScores: Record<AreaKey, number>,
  petName: string,
): RoadmapStep[] {
  const ranked = [...WELLNESS_AREAS].sort((a, b) => {
    const byRatio =
      areaScores[a.key] / maxPointsFor(a) - areaScores[b.key] / maxPointsFor(b);
    if (byRatio !== 0) return byRatio;
    return maxPointsFor(b) - maxPointsFor(a);
  });

  const weakest = ranked.slice(0, ROADMAP_LENGTH);
  const nothingToFix = weakest.every(
    (area) => areaScores[area.key] === maxPointsFor(area),
  );

  return weakest.map((area, index) => ({
    timeframe: ROADMAP_TIMEFRAMES[index],
    area: area.shortLabel,
    title: nothingToFix ? area.maintenanceTitle : area.planTitle,
    detail: fillPetName(
      nothingToFix ? area.maintenanceDetail : area.planDetail,
      petName,
    ),
  }));
}

/**
 * Score a complete answer set.
 *
 * Throws on an incomplete set: the caller validates first, and a partial score
 * shown as though it were whole would be worse than no score at all.
 */
export function scoreAnswers(answers: Answers, petName = ""): WellnessResult {
  const areaScores = {} as Record<AreaKey, number>;
  const strongAreas: AreaBreakdown[] = [];
  const areasToStrengthen: AreaBreakdown[] = [];

  for (const area of WELLNESS_AREAS) {
    const slug = answers[area.key];
    if (!slug) throw new Error(`Missing answer for ${area.key}`);

    const breakdown = breakdownFor(area, slug);
    areaScores[area.key] = breakdown.points;
    // Full marks is the bar rather than a ratio, because it maps exactly onto
    // what the visitor tapped: they either answered "yes" or they did not.
    const bucket =
      breakdown.points === breakdown.maxPoints ? strongAreas : areasToStrengthen;
    bucket.push(breakdown);
  }

  const totalScore = Object.values(areaScores).reduce(
    (total, points) => total + points,
    0,
  );

  return {
    totalScore,
    band: bandFor(totalScore),
    areaScores,
    strongAreas,
    areasToStrengthen,
    roadmap: roadmapFor(areaScores, petName),
  };
}

export function isComplete(answers: Answers): boolean {
  return WELLNESS_AREAS.every((area) => Boolean(answers[area.key]));
}

export function answeredCount(answers: Answers): number {
  return WELLNESS_AREAS.filter((area) => Boolean(answers[area.key])).length;
}
