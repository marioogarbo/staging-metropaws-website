"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CONSENT_TEXT_VERSION,
  WELLNESS_AREAS,
  isComplete,
  resolveSource,
  scoreAnswers,
  type AnswerSlug,
  type Answers,
  type AreaKey,
  type PetType,
  type WellnessResult,
} from "@/lib/wellness-scoring";
import {
  WellnessCheckIntake,
  type IntakeErrors,
} from "@/components/wellness-check-intake";
import { WellnessCheckQuestion } from "@/components/wellness-check-question";
import {
  WellnessCheckContact,
  type ContactDetails,
  type ContactErrors,
} from "@/components/wellness-check-contact";
import {
  WellnessCheckResult,
  type SaveStatus,
} from "@/components/wellness-check-result";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "https://metropaws-backend.onrender.com";

const DRAFT_KEY = "mp.wellness.v1";
const QUEUE_KEY = "mp.wellness.pending";
const SUBMIT_TIMEOUT_MS = 20_000;
const RETRY_DELAY_MS = 3_000;

type Stage = "intake" | "question" | "contact" | "result";

interface Draft {
  petName: string;
  petType: PetType | null;
  annualSpend: string;
  answers: Answers;
  stage: Stage;
  questionIndex: number;
}

const EMPTY_DRAFT: Draft = {
  petName: "",
  petType: null,
  annualSpend: "",
  answers: {},
  stage: "intake",
  questionIndex: 0,
};

const EMPTY_CONTACT: ContactDetails = {
  ownerName: "",
  channel: "mobile",
  contact: "",
  consentGiven: false,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const NO_INTAKE_ERRORS: IntakeErrors = { petName: null, petType: null };
const NO_CONTACT_ERRORS: ContactErrors = { ownerName: null, contact: null };

/** Strip to a 10-digit local number starting with 9, matching the backend. */
function sanitizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length === 12) return digits.slice(2);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/** Every storage read and write is optional: Safari private mode throws. */
function readStorage(store: Storage | undefined, key: string): string | null {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(store: Storage | undefined, key: string, value: string) {
  try {
    store?.setItem(key, value);
  } catch {
    // An in-memory session is still a working session. Nothing to recover.
  }
}

interface SubmissionPayload {
  answers: Answers;
  pet_name: string | null;
  pet_type: PetType;
  annual_spend_bracket: string | null;
  owner_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  consent_given: boolean;
  consent_text_version: string | null;
  source: string;
  client_submission_id: string;
}

async function postCheck(payload: SubmissionPayload): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);
  try {
    return await fetch(`${BACKEND_URL}/wellness-checks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * The state machine behind the readiness check.
 *
 * The one rule that matters here: `stage` and `saveStatus` are independent. The
 * result renders from arithmetic done in this browser, so it appears whatever
 * the network did. Submission happens afterwards, in the background, and a
 * failure costs the lead and never the visitor's result. On expo wifi against a
 * Render instance that may be cold, any other order loses the interaction.
 */
export function WellnessCheck() {
  const searchParams = useSearchParams();
  const source = resolveSource(searchParams.get("src"));

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [contact, setContact] = useState<ContactDetails>(EMPTY_CONTACT);
  const [contactErrors, setContactErrors] =
    useState<ContactErrors>(NO_CONTACT_ERRORS);
  const [intakeErrors, setIntakeErrors] =
    useState<IntakeErrors>(NO_INTAKE_ERRORS);
  const [stepError, setStepError] = useState<string | null>(null);
  const [result, setResult] = useState<WellnessResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const submissionId = useRef<string | null>(null);

  const displayName = draft.petName.trim() || "your pet";

  // Wake a sleeping Render instance while the visitor reads question one.
  // Eight questions take longer than a cold start, so the real POST lands warm.
  useEffect(() => {
    fetch(`${BACKEND_URL}/health`, { cache: "no-store" }).catch(() => {});
  }, []);

  // Restore in an effect, never during render: reading storage while rendering
  // produces markup the server could not have produced.
  useEffect(() => {
    const saved = readStorage(globalThis.sessionStorage, DRAFT_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as Draft;
      // A restored draft never lands on the result: the score is derived, and
      // showing one without re-deriving it would be showing a stale number.
      setDraft({
        ...parsed,
        stage: parsed.stage === "result" ? "contact" : parsed.stage,
      });
    } catch {
      // A malformed draft is not worth recovering from. Start clean.
    }
  }, []);

  useEffect(() => {
    writeStorage(globalThis.sessionStorage, DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  const drainQueue = useCallback(async () => {
    const queued = readStorage(globalThis.localStorage, QUEUE_KEY);
    if (!queued) return;
    let payloads: SubmissionPayload[] = [];
    try {
      payloads = JSON.parse(queued) as SubmissionPayload[];
    } catch {
      writeStorage(globalThis.localStorage, QUEUE_KEY, "[]");
      return;
    }

    const unsent: SubmissionPayload[] = [];
    for (const payload of payloads) {
      try {
        const response = await postCheck(payload);
        if (!response.ok) unsent.push(payload);
      } catch {
        unsent.push(payload);
      }
    }
    writeStorage(globalThis.localStorage, QUEUE_KEY, JSON.stringify(unsent));
    if (payloads.length && !unsent.length) setSaveStatus("saved");
  }, []);

  useEffect(() => {
    drainQueue();
    globalThis.addEventListener("online", drainQueue);
    return () => globalThis.removeEventListener("online", drainQueue);
  }, [drainQueue]);

  function queuePayload(payload: SubmissionPayload) {
    const existing = readStorage(globalThis.localStorage, QUEUE_KEY);
    let payloads: SubmissionPayload[] = [];
    try {
      payloads = existing ? (JSON.parse(existing) as SubmissionPayload[]) : [];
    } catch {
      payloads = [];
    }
    payloads.push(payload);
    writeStorage(globalThis.localStorage, QUEUE_KEY, JSON.stringify(payloads));
    setSaveStatus("queued");
  }

  const goToStage = useCallback((stage: Stage, questionIndex?: number) => {
    setStepError(null);
    setDraft((current) => ({
      ...current,
      stage,
      questionIndex: questionIndex ?? current.questionIndex,
    }));
  }, []);

  // A history entry per step, so the Android back gesture steps back one
  // question instead of leaving the page and taking seven answers with it.
  useEffect(() => {
    function handlePopState(event: PopStateEvent) {
      const state = event.state as {
        wellnessStage?: Stage;
        index?: number;
      } | null;
      if (!state?.wellnessStage) return;
      goToStage(state.wellnessStage, state.index);
    }
    globalThis.addEventListener("popstate", handlePopState);
    return () => globalThis.removeEventListener("popstate", handlePopState);
  }, [goToStage]);

  function pushStage(stage: Stage, questionIndex: number) {
    globalThis.history?.pushState(
      { wellnessStage: stage, index: questionIndex },
      "",
      globalThis.location?.href,
    );
    goToStage(stage, questionIndex);
  }

  function submit(details: ContactDetails) {
    const scored = scoreAnswers(draft.answers, draft.petName);
    setResult(scored);
    pushStage("result", draft.questionIndex);

    if (!draft.petType) return;

    const trimmed = details.contact.trim();
    const isEmail = details.channel === "email";
    submissionId.current ??=
      globalThis.crypto?.randomUUID?.() ?? String(Date.now());

    const payload: SubmissionPayload = {
      answers: draft.answers,
      pet_name: draft.petName.trim() || null,
      pet_type: draft.petType,
      annual_spend_bracket: draft.annualSpend || null,
      owner_name: details.ownerName.trim() || null,
      contact_email: isEmail && trimmed ? trimmed.toLowerCase() : null,
      contact_phone: !isEmail && trimmed ? sanitizePhone(trimmed) : null,
      consent_given: details.consentGiven,
      consent_text_version: details.consentGiven ? CONSENT_TEXT_VERSION : null,
      source,
      client_submission_id: submissionId.current,
    };

    void send(payload, scored.totalScore);
  }

  async function send(
    payload: SubmissionPayload,
    shownScore: number,
    isRetry = false,
  ) {
    setSaveStatus("saving");
    try {
      const response = await postCheck(payload);
      if (!response.ok) {
        if (isRetry) return queuePayload(payload);
        return void setTimeout(
          () => send(payload, shownScore, true),
          RETRY_DELAY_MS,
        );
      }

      const body = (await response.json()) as { total_score?: number };
      // The reconciliation point for the two copies of the rubric. The number
      // on screen is never replaced: swapping a figure the visitor is already
      // reading is worse than being a couple of points out.
      if (body.total_score !== shownScore) {
        console.warn(
          `[wellness] score mismatch: shown ${shownScore}, stored ${body.total_score}. ` +
            "The rubric mirrors have drifted apart.",
        );
      }
      setSaveStatus("saved");
    } catch {
      if (isRetry) return queuePayload(payload);
      setTimeout(() => send(payload, shownScore, true), RETRY_DELAY_MS);
    }
  }

  function handleStart() {
    const errors: IntakeErrors = {
      petType: draft.petType ? null : "Choose whether this is a dog or a cat.",
      petName: draft.petName.trim()
        ? null
        : "Tell us your pet's name so we can personalise the result.",
    };
    setIntakeErrors(errors);
    if (errors.petType || errors.petName) return;
    pushStage("question", 0);
  }

  function handleAnswer(key: AreaKey, slug: AnswerSlug) {
    setStepError(null);
    setDraft((current) => ({
      ...current,
      answers: { ...current.answers, [key]: slug },
    }));
  }

  function handleNext() {
    if (!draft.answers[WELLNESS_AREAS[draft.questionIndex].key]) {
      setStepError("Pick one option to continue.");
      return;
    }
    if (draft.questionIndex < WELLNESS_AREAS.length - 1) {
      pushStage("question", draft.questionIndex + 1);
      return;
    }
    if (!isComplete(draft.answers)) {
      const firstGap = WELLNESS_AREAS.findIndex(
        (area) => !draft.answers[area.key],
      );
      setStepError("One question is still unanswered.");
      pushStage("question", firstGap);
      return;
    }
    pushStage("contact", draft.questionIndex);
  }

  function handleBack() {
    if (draft.questionIndex === 0) {
      pushStage("intake", 0);
      return;
    }
    pushStage("question", draft.questionIndex - 1);
  }

  function handleContactSubmit() {
    const trimmed = contact.contact.trim();
    const isEmail = contact.channel === "email";
    const digits = sanitizePhone(trimmed);

    const errors: ContactErrors = {
      ownerName: contact.ownerName.trim() ? null : "Enter your name.",
      contact: contactError(trimmed, isEmail, digits),
    };
    setContactErrors(errors);
    if (errors.ownerName || errors.contact) return;

    submit(contact);
  }

  function contactError(
    trimmed: string,
    isEmail: boolean,
    digits: string,
  ): string | null {
    if (!trimmed) {
      return isEmail
        ? "Enter an email address so we can reach you."
        : "Enter a mobile number so we can reach you.";
    }
    if (isEmail && !EMAIL_PATTERN.test(trimmed)) {
      return "Enter a valid email address.";
    }
    if (!isEmail && (digits.length !== 10 || !digits.startsWith("9"))) {
      return "Enter an 11-digit mobile number, for example 0917 123 4567.";
    }
    return null;
  }

  function handleCheckAnother() {
    try {
      globalThis.sessionStorage?.removeItem(DRAFT_KEY);
    } catch {
      // Nothing to clear is the same outcome as clearing it.
    }
    submissionId.current = null;
    setContact(EMPTY_CONTACT);
    setContactErrors(NO_CONTACT_ERRORS);
    setIntakeErrors(NO_INTAKE_ERRORS);
    setResult(null);
    setSaveStatus("idle");
    setDraft(EMPTY_DRAFT);
    pushStage("intake", 0);
  }

  const petTypeLabel = useMemo(() => draft.petType ?? "", [draft.petType]);

  return (
    <section className="bg-(--color-cream) pb-20 md:pb-28 print:pb-0">
      <div className="max-w-6xl mx-auto px-6">
        {draft.stage === "intake" ? (
          <div className="mp-settle">
            <WellnessCheckIntake
              petName={draft.petName}
              petType={draft.petType}
              annualSpend={draft.annualSpend}
              errors={intakeErrors}
              onChange={(patch) => {
                setIntakeErrors(NO_INTAKE_ERRORS);
                setDraft((current) => ({ ...current, ...patch }));
              }}
              onStart={handleStart}
            />
          </div>
        ) : null}

        {draft.stage === "question" ? (
          <div className="mp-settle">
            <WellnessCheckQuestion
              index={draft.questionIndex}
              answers={draft.answers}
              displayName={displayName}
              petType={petTypeLabel}
              error={stepError}
              onAnswer={handleAnswer}
              onBack={handleBack}
              onNext={handleNext}
              onJumpTo={(index) => pushStage("question", index)}
            />
          </div>
        ) : null}

        {draft.stage === "contact" ? (
          <div className="mp-settle">
            <WellnessCheckContact
              displayName={displayName}
              details={contact}
              errors={contactErrors}
              onChange={(patch) => {
                setContactErrors(NO_CONTACT_ERRORS);
                setContact((current) => ({ ...current, ...patch }));
              }}
              onSubmit={handleContactSubmit}
            />
          </div>
        ) : null}

        {draft.stage === "result" && result ? (
          <WellnessCheckResult
            result={result}
            displayName={displayName}
            petType={petTypeLabel}
            annualSpend={draft.annualSpend}
            saveStatus={saveStatus}
            onCheckAnother={handleCheckAnother}
          />
        ) : null}
      </div>
    </section>
  );
}
