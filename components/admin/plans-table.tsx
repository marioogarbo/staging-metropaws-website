"use client";

import {
  useActionState,
  useState,
  useTransition,
  useRef,
  useEffect,
  useCallback,
  useId,
} from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Star, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createPlanAction,
  updatePlanAction,
  deletePlanAction,
  type ActionState,
} from "@/app/admin/(protected)/plans/actions";
import type { Plan, PlanService, ServiceType } from "@/app/admin/(protected)/plans/page";

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_FEATURES = 20;
const MAX_FEATURE_LEN = 200;
const MAX_SESSIONS = 365;
const SESSION_EXPIRED_MSG = "Session expired. Please log in again.";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPHP(amount: number): string {
  return `₱${amount.toLocaleString("en-PH")}`;
}

// ── Shared form primitives ────────────────────────────────────────────────────

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  maxLength,
  min,
  max,
  readOnly,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  min?: number;
  max?: number;
  readOnly?: boolean;
}) {
  const id = useId();

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[oklch(0.48_0.02_258)] text-xs font-medium mb-1"
      >
        {label}
        {required && <span className="text-[oklch(0.72_0.115_82)] ml-0.5">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        readOnly={readOnly}
        className={cn(
          "w-full bg-[oklch(0.97_0.01_80)] border border-[oklch(0.88_0.010_258)] rounded-lg px-3 py-2",
          "text-sm text-[oklch(0.24_0.055_258)] placeholder:text-[oklch(0.72_0.01_258)]",
          "focus:outline-none focus:ring-2 focus:ring-[oklch(0.72_0.115_82)] focus:border-transparent",
          "transition-colors duration-150",
          readOnly && "cursor-default",
        )}
      />
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cn("flex items-start gap-2 select-none group", !disabled && "cursor-pointer")}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 w-4 h-4 rounded accent-[oklch(0.72_0.115_82)]"
      />
      <span className="text-[oklch(0.48_0.02_258)] text-xs font-medium group-hover:text-[oklch(0.24_0.055_258)] transition-colors">
        {label}
        {description && (
          <span className="block text-[oklch(0.72_0.01_258)] font-normal mt-0.5">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

// ── Features List Input ───────────────────────────────────────────────────────

function FeaturesInput({
  features,
  onChange,
  disabled,
}: {
  features: string[];
  onChange: (features: string[]) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");

  const atLimit = features.length >= MAX_FEATURES;

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed || atLimit) return;
    const clamped = trimmed.slice(0, MAX_FEATURE_LEN);
    onChange([...features, clamped]);
    setDraft("");
  };

  const remove = (idx: number) => {
    onChange(features.filter((_, i) => i !== idx));
  };

  const update = (idx: number, val: string) => {
    onChange(features.map((f, i) => (i === idx ? val.slice(0, MAX_FEATURE_LEN) : f)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[oklch(0.48_0.02_258)] text-xs font-semibold">Features</p>
        <span className="text-[oklch(0.72_0.01_258)] text-[0.625rem] tabular-nums">
          {features.length}/{MAX_FEATURES}
        </span>
      </div>

      {features.map((f, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            type="text"
            value={f}
            onChange={(e) => update(idx, e.target.value)}
            maxLength={MAX_FEATURE_LEN}
            readOnly={disabled}
            className={cn(
              "flex-1 min-w-0 bg-[oklch(0.97_0.01_80)] border border-[oklch(0.88_0.010_258)] rounded-lg px-3 py-2",
              "text-sm text-[oklch(0.24_0.055_258)] placeholder:text-[oklch(0.72_0.01_258)]",
              "focus:outline-none focus:ring-2 focus:ring-[oklch(0.72_0.115_82)] focus:border-transparent",
              "transition-colors duration-150",
              disabled && "cursor-default",
            )}
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            disabled={disabled}
            aria-label="Remove feature"
            className="shrink-0 flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 sm:p-1 rounded-lg text-[oklch(0.72_0.01_258)] hover:text-red-500 transition-colors disabled:opacity-40"
          >
            <X size={13} />
          </button>
        </div>
      ))}

      {!atLimit && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_FEATURE_LEN))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            disabled={disabled}
            placeholder="Add a feature…"
            className={cn(
              "flex-1 min-w-0 bg-[oklch(0.97_0.01_80)] border border-dashed border-[oklch(0.88_0.010_258)] rounded-lg px-3 py-2",
              "text-sm text-[oklch(0.24_0.055_258)] placeholder:text-[oklch(0.72_0.01_258)]",
              "focus:outline-none focus:ring-2 focus:ring-[oklch(0.72_0.115_82)] focus:border-transparent",
              "transition-colors duration-150",
            )}
          />
          <button
            type="button"
            onClick={add}
            disabled={disabled}
            className="shrink-0 px-3 py-2 rounded-lg bg-[oklch(0.94_0.015_75)] text-[oklch(0.48_0.02_258)] text-xs font-medium hover:bg-[oklch(0.90_0.020_75)] transition-colors disabled:opacity-40"
          >
            Add
          </button>
        </div>
      )}

      {atLimit && (
        <p className="text-[oklch(0.72_0.01_258)] text-[0.625rem]">
          Maximum {MAX_FEATURES} features reached.
        </p>
      )}
    </div>
  );
}

// ── Dialog overlay + shell ────────────────────────────────────────────────────

function Overlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(18,24,38,0.55)" }}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg">{children}</div>
    </div>
  );
}

function DialogShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const shellRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const firstFocusable = el.querySelector<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !shellRef.current) return;

      const focusable = shellRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      ref={shellRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="bg-[oklch(0.99_0.005_80)] rounded-xl shadow-xl border border-[oklch(0.88_0.010_258)] overflow-hidden max-h-[90vh] flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-[oklch(0.92_0.010_258)] shrink-0 min-w-0">
        <h2
          id={titleId}
          className="text-sm text-[oklch(0.24_0.055_258)] font-semibold truncate mr-3"
        >
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="shrink-0 p-1 -mr-1 rounded text-[oklch(0.72_0.01_258)] hover:text-[oklch(0.48_0.02_258)] transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <div className="px-6 py-5 overflow-y-auto">{children}</div>
    </div>
  );
}

// ── Reimbursement caps Input ──────────────────────────────────────────────────

/** Centavos → the peso string shown in the cap input (empty when 0/unset). */
function centavosToPesoInput(centavos: number): string {
  if (!centavos || centavos <= 0) return "";
  const pesos = centavos / 100;
  return Number.isInteger(pesos) ? String(pesos) : pesos.toFixed(2);
}

/** The peso cap input used for one category row. */
function CapPesoInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative w-28 shrink-0">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[oklch(0.72_0.01_258)]">
        ₱
      </span>
      <input
        type="text"
        inputMode="decimal"
        aria-label={`${label} reimbursement cap in pesos per year`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        readOnly={disabled}
        className={cn(
          "w-full bg-[oklch(0.97_0.01_80)] border border-[oklch(0.88_0.010_258)] rounded-lg pl-6 pr-3 py-2",
          "text-sm text-right tabular-nums text-[oklch(0.24_0.055_258)] placeholder:text-[oklch(0.72_0.01_258)]",
          "focus:outline-none focus:ring-2 focus:ring-[oklch(0.72_0.115_82)] focus:border-transparent",
          "transition-colors duration-150",
          disabled && "cursor-default",
        )}
      />
    </div>
  );
}

function CapsInput({
  services,
  availableToAdd,
  caps,
  onCapsChange,
  addedIds,
  sessions,
  onSessionsChange,
  onAddCategory,
  onRemoveCategory,
  disabled,
}: {
  services: PlanService[];
  availableToAdd: ServiceType[];
  caps: Record<string, string>;
  onCapsChange: (caps: Record<string, string>) => void;
  addedIds: string[];
  sessions: Record<string, string>;
  onSessionsChange: (sessions: Record<string, string>) => void;
  onAddCategory: (serviceType: ServiceType) => void;
  onRemoveCategory: (serviceTypeId: string) => void;
  disabled?: boolean;
}) {
  const addedTypes = addedIds
    .map((id) => availableToAdd.find((t) => t.id === id))
    .filter((t): t is ServiceType => Boolean(t));
  // Types offered in the picker: available minus the ones already added here.
  const pickable = availableToAdd.filter((t) => !addedIds.includes(t.id));

  return (
    <div className="space-y-2">
      <p className="text-[oklch(0.48_0.02_258)] text-xs font-semibold">
        Reimbursement caps
      </p>
      <p className="text-[oklch(0.72_0.01_258)] text-[0.625rem] leading-relaxed">
        The most a member can be reimbursed per pet, per category, each benefit year.
        Set <span className="font-semibold">0</span> to make a category
        non-reimbursable. Changes apply to everyone on this plan for the current year
        and won&apos;t reduce amounts already used.
      </p>
      <div className="space-y-1.5 pt-0.5">
        {services.map((s) => (
          <div key={s.service_type.id} className="flex items-center gap-3">
            <span className="flex-1 min-w-0 truncate text-xs text-[oklch(0.40_0.040_258)]">
              {s.service_type.name}
            </span>
            <CapPesoInput
              label={s.service_type.name}
              value={caps[s.service_type.id] ?? ""}
              onChange={(v) => onCapsChange({ ...caps, [s.service_type.id]: v })}
              disabled={disabled}
            />
          </div>
        ))}

        {/* Newly added categories — also capture a sessions grant. */}
        {addedTypes.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <span className="flex-1 min-w-0 truncate text-xs text-[oklch(0.40_0.040_258)]">
              {t.name}
              <span className="ml-1.5 text-[0.625rem] text-[oklch(0.72_0.115_82)] font-medium">
                new
              </span>
            </span>
            <div className="relative w-20 shrink-0">
              <input
                type="number"
                min={0}
                max={MAX_SESSIONS}
                aria-label={`${t.name} sessions granted`}
                value={sessions[t.id] ?? "0"}
                onChange={(e) =>
                  onSessionsChange({ ...sessions, [t.id]: e.target.value })
                }
                placeholder="0"
                readOnly={disabled}
                className={cn(
                  "w-full bg-[oklch(0.97_0.01_80)] border border-[oklch(0.88_0.010_258)] rounded-lg px-2 py-2",
                  "text-sm text-right tabular-nums text-[oklch(0.24_0.055_258)] placeholder:text-[oklch(0.72_0.01_258)]",
                  "focus:outline-none focus:ring-2 focus:ring-[oklch(0.72_0.115_82)] focus:border-transparent",
                  "transition-colors duration-150",
                  disabled && "cursor-default",
                )}
              />
              <span className="pointer-events-none absolute -bottom-3.5 right-0 text-[0.5rem] text-[oklch(0.72_0.01_258)]">
                sessions
              </span>
            </div>
            <CapPesoInput
              label={t.name}
              value={caps[t.id] ?? ""}
              onChange={(v) => onCapsChange({ ...caps, [t.id]: v })}
              disabled={disabled}
            />
            <button
              type="button"
              onClick={() => onRemoveCategory(t.id)}
              disabled={disabled}
              aria-label={`Remove ${t.name}`}
              className="shrink-0 flex items-center justify-center p-1 rounded-lg text-[oklch(0.72_0.01_258)] hover:text-red-500 transition-colors disabled:opacity-40"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      {addedTypes.length > 0 && (
        <p className="text-[oklch(0.72_0.01_258)] text-[0.5625rem] leading-relaxed pt-3">
          Sessions apply to new activations and renewals; the cap applies to everyone
          on this plan immediately.
        </p>
      )}

      {/* Add-category picker */}
      {pickable.length > 0 && (
        <div className="pt-1">
          <select
            aria-label="Add a service category to this plan"
            value=""
            disabled={disabled}
            onChange={(e) => {
              const t = pickable.find((x) => x.id === e.target.value);
              if (t) onAddCategory(t);
            }}
            className={cn(
              "w-full bg-[oklch(0.97_0.01_80)] border border-dashed border-[oklch(0.88_0.010_258)] rounded-lg px-3 py-2",
              "text-sm text-[oklch(0.48_0.02_258)]",
              "focus:outline-none focus:ring-2 focus:ring-[oklch(0.72_0.115_82)] focus:border-transparent",
              "transition-colors duration-150 disabled:opacity-40",
            )}
          >
            <option value="">+ Add a service category…</option>
            {pickable.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

// ── Plan form (create + edit) ─────────────────────────────────────────────────

function PlanFormDialog({
  plan,
  serviceTypes,
  onClose,
  onSuccess,
}: {
  plan: Plan | null;
  serviceTypes: ServiceType[];
  onClose: () => void;
  onSuccess: (action: "created" | "updated") => void;
}) {
  const isEdit = plan !== null;
  const initialState: ActionState = { error: null };
  const action = isEdit ? updatePlanAction : createPlanAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [name, setName] = useState(plan?.name ?? "");
  const [tagline, setTagline] = useState(plan?.tagline ?? "");
  const [price, setPrice] = useState(plan?.price != null ? String(plan.price) : "");
  const [priceMonthly, setPriceMonthly] = useState(
    plan?.price_monthly != null ? String(plan.price_monthly) : "",
  );
  const [sortOrder, setSortOrder] = useState(String(plan?.sort_order ?? "0"));
  const [isFeatured, setIsFeatured] = useState(plan?.is_featured ?? false);
  const [isActive, setIsActive] = useState(plan?.is_active ?? true);
  const [features, setFeatures] = useState<string[]>(plan?.features ?? []);

  const planServices = plan?.plan_services ?? [];
  const [caps, setCaps] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const s of planServices) {
      init[s.service_type.id] = centavosToPesoInput(s.reimbursement_cap_centavos);
    }
    return init;
  });
  // Categories the admin is adding to this plan (not yet on plan_services).
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [sessions, setSessions] = useState<Record<string, string>>({});

  // Service types not already granted by this plan — candidates for "add".
  const existingTypeIds = new Set(planServices.map((s) => s.service_type.id));
  const availableToAdd = serviceTypes.filter((t) => !existingTypeIds.has(t.id));

  const addCategory = (t: ServiceType) => {
    setAddedIds((prev) => (prev.includes(t.id) ? prev : [...prev, t.id]));
    setCaps((prev) => ({ ...prev, [t.id]: prev[t.id] ?? "" }));
    setSessions((prev) => ({ ...prev, [t.id]: prev[t.id] ?? "0" }));
  };

  const removeCategory = (id: string) => {
    setAddedIds((prev) => prev.filter((x) => x !== id));
    setCaps((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSessions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const serviceCapsPayload = [
    ...planServices.map((s) => ({
      service_type_id: s.service_type.id,
      peso: caps[s.service_type.id] ?? "",
    })),
    ...addedIds.map((id) => ({
      service_type_id: id,
      peso: caps[id] ?? "",
      sessions: sessions[id] ?? "0",
    })),
  ];

  const prevPending = useRef(false);

  useEffect(() => {
    if (prevPending.current && !pending && !state.error) {
      onSuccess(isEdit ? "updated" : "created");
    }
    prevPending.current = pending;
  }, [pending, state.error, onSuccess, isEdit]);

  const dialogTitle = isEdit
    ? `Edit plan · ${plan.name.length > 30 ? plan.name.slice(0, 30) + "…" : plan.name}`
    : "New plan";

  const isSessionExpired = state.error === SESSION_EXPIRED_MSG;

  return (
    <Overlay onClose={onClose}>
      <DialogShell title={dialogTitle} onClose={onClose}>
        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="planId" value={plan.id} />}
          <input type="hidden" name="is_featured" value={isFeatured ? "true" : "false"} />
          <input type="hidden" name="is_active" value={isActive ? "true" : "false"} />
          <input type="hidden" name="features" value={JSON.stringify(features)} />
          {isEdit && serviceCapsPayload.length > 0 && (
            <input
              type="hidden"
              name="service_caps"
              value={JSON.stringify(serviceCapsPayload)}
            />
          )}

          {/* Visually freeze form body while action is in flight */}
          <div className={cn("space-y-4 transition-opacity duration-150", pending && "opacity-60 pointer-events-none")}>
            <div className="grid grid-cols-[1fr_80px] gap-3">
              <Field
                label="Plan name"
                name="name"
                value={name}
                onChange={setName}
                placeholder="e.g. Standard"
                required
                maxLength={100}
                readOnly={pending}
              />
              <Field
                label="Sort"
                name="sort_order"
                type="number"
                value={sortOrder}
                onChange={setSortOrder}
                placeholder="0"
                min={0}
                max={999}
                readOnly={pending}
              />
            </div>

            <Field
              label="Tagline"
              name="tagline"
              value={tagline}
              onChange={setTagline}
              placeholder="Short description shown on the pricing card"
              maxLength={200}
              readOnly={pending}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field
                label="Annual price (₱)"
                name="price"
                type="number"
                value={price}
                onChange={setPrice}
                placeholder="e.g. 2500"
                required
                min={0}
                readOnly={pending}
              />
              <Field
                label="Monthly price (₱, optional)"
                name="price_monthly"
                type="number"
                value={priceMonthly}
                onChange={setPriceMonthly}
                placeholder="e.g. 250"
                min={0}
                readOnly={pending}
              />
            </div>

            <div className="flex gap-6 pt-1">
              <Toggle
                label="Featured plan"
                description="Highlighted on pricing page"
                checked={isFeatured}
                onChange={setIsFeatured}
                disabled={pending}
              />
              <Toggle
                label="Active"
                description="Visible to members"
                checked={isActive}
                onChange={setIsActive}
                disabled={pending}
              />
            </div>

            <div className="pt-1">
              <FeaturesInput features={features} onChange={setFeatures} disabled={pending} />
            </div>

            {isEdit && (planServices.length > 0 || availableToAdd.length > 0) && (
              <div className="pt-1 border-t border-[oklch(0.92_0.010_258)] mt-1">
                <div className="pt-3">
                  <CapsInput
                    services={planServices}
                    availableToAdd={availableToAdd}
                    caps={caps}
                    onCapsChange={setCaps}
                    addedIds={addedIds}
                    sessions={sessions}
                    onSessionsChange={setSessions}
                    onAddCategory={addCategory}
                    onRemoveCategory={removeCategory}
                    disabled={pending}
                  />
                </div>
              </div>
            )}
          </div>

          {state.error && (
            <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg leading-relaxed">
              {state.error}
              {isSessionExpired && (
                <>
                  {" "}
                  <a href="/admin/login" className="underline font-semibold">
                    Log in
                  </a>
                </>
              )}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="flex-1 py-3 sm:py-2 rounded-lg border border-[oklch(0.88_0.010_258)] text-[oklch(0.48_0.02_258)] text-xs font-medium hover:bg-[oklch(0.94_0.015_75)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-3 sm:py-2 rounded-lg bg-[oklch(0.24_0.055_258)] text-[oklch(0.72_0.115_82)] text-xs font-semibold hover:bg-[oklch(0.32_0.050_258)] disabled:opacity-50 transition-colors"
            >
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create plan"}
            </button>
          </div>
        </form>
      </DialogShell>
    </Overlay>
  );
}

// ── Delete confirmation ───────────────────────────────────────────────────────

function DeleteConfirmCard({
  plan,
  onCancel,
  onDeleted,
}: {
  plan: Plan;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await deletePlanAction(plan.id);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        onDeleted();
      }
    });
  };

  const truncatedName =
    plan.name.length > 40 ? plan.name.slice(0, 40) + "…" : plan.name;

  return (
    <div className="h-full rounded-xl bg-[oklch(0.99_0.005_80)] border border-red-200 p-5 flex flex-col gap-4 justify-center">
      <p className="text-xs text-[oklch(0.24_0.055_258)] leading-relaxed">
        Delete <span className="font-semibold">{truncatedName}</span>? This cannot be undone
        and will affect members assigned this plan.
      </p>
      {error && (
        <p className="text-red-600 text-xs leading-relaxed">
          {error}
          {error === SESSION_EXPIRED_MSG && (
            <>
              {" "}
              <a href="/admin/login" className="underline font-semibold">
                Log in
              </a>
            </>
          )}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 py-3 sm:py-2 rounded-lg border border-[oklch(0.88_0.010_258)] text-[oklch(0.48_0.02_258)] text-xs font-medium hover:bg-[oklch(0.94_0.015_75)] transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="flex-1 py-3 sm:py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

// ── Plan card ──────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: Plan;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isFeatured = plan.is_featured;

  return (
    <div
      className={cn(
        "rounded-xl border flex flex-col h-full",
        isFeatured
          ? "bg-[oklch(0.24_0.055_258)] border-[oklch(0.32_0.050_258)]"
          : "bg-[oklch(0.99_0.005_80)] border-[oklch(0.88_0.010_258)]",
      )}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[oklch(0.72_0.115_82)/15] text-[oklch(0.72_0.115_82)] text-xs font-semibold">
                <Star size={9} />
                Featured
              </span>
            )}
            {plan.is_active ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                  isFeatured
                    ? "bg-white/10 text-white/70"
                    : "bg-[oklch(0.94_0.015_75)] text-[oklch(0.40_0.040_258)]",
                )}
              >
                <CheckCircle size={9} />
                Active
              </span>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                  isFeatured
                    ? "bg-white/10 text-white/40"
                    : "bg-[oklch(0.94_0.015_75)] text-[oklch(0.65_0.020_258)]",
                )}
              >
                <XCircle size={9} />
                Inactive
              </span>
            )}
          </div>
          <span
            className={cn(
              "text-xs tabular-nums shrink-0",
              isFeatured ? "text-white/30" : "text-[oklch(0.72_0.01_258)]",
            )}
          >
            #{plan.sort_order}
          </span>
        </div>

        <p
          className={cn(
            "text-lg font-bold leading-tight tracking-tight wrap-break-word",
            isFeatured ? "text-white" : "text-[oklch(0.24_0.055_258)]",
          )}
        >
          {plan.name}
        </p>
        {plan.tagline && (
          <p
            className={cn(
              "mt-1 text-xs leading-snug wrap-break-word",
              isFeatured ? "text-white/50" : "text-[oklch(0.72_0.01_258)]",
            )}
          >
            {plan.tagline}
          </p>
        )}
      </div>

      {/* Prices */}
      <div
        className={cn(
          "mx-5 mb-4 rounded-lg px-4 py-3 flex items-center gap-5",
          isFeatured ? "bg-white/8" : "bg-[oklch(0.97_0.01_80)]",
        )}
      >
        <div className="min-w-0">
          <p
            className={cn(
              "text-xl font-bold tabular-nums leading-none truncate",
              isFeatured ? "text-[oklch(0.72_0.115_82)]" : "text-[oklch(0.24_0.055_258)]",
            )}
          >
            {formatPHP(plan.price)}
          </p>
          <p
            className={cn(
              "mt-1 text-[0.625rem] uppercase tracking-wide font-medium",
              isFeatured ? "text-white/40" : "text-[oklch(0.72_0.01_258)]",
            )}
          >
            per year
          </p>
        </div>
        {plan.price_monthly !== null && (
          <>
            <div
              className={cn(
                "w-px self-stretch shrink-0",
                isFeatured ? "bg-white/10" : "bg-[oklch(0.88_0.010_258)]",
              )}
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "text-base font-semibold tabular-nums leading-none truncate",
                  isFeatured ? "text-white/70" : "text-[oklch(0.48_0.02_258)]",
                )}
              >
                {formatPHP(plan.price_monthly)}
              </p>
              <p
                className={cn(
                  "mt-1 text-[0.625rem] uppercase tracking-wide font-medium",
                  isFeatured ? "text-white/40" : "text-[oklch(0.72_0.01_258)]",
                )}
              >
                per month
              </p>
            </div>
          </>
        )}
      </div>

      {/* Features */}
      <div className="px-5 flex-1">
        {plan.features.length === 0 ? (
          <p
            className={cn(
              "text-xs",
              isFeatured ? "text-white/30" : "text-[oklch(0.72_0.01_258)]",
            )}
          >
            No features listed
          </p>
        ) : (
          <ul className="space-y-1.5">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-1 shrink-0 w-1 h-1 rounded-full",
                    isFeatured ? "bg-[oklch(0.72_0.115_82)]" : "bg-[oklch(0.72_0.01_258)]",
                  )}
                />
                <span
                  className={cn(
                    "text-xs leading-snug wrap-break-word min-w-0",
                    isFeatured ? "text-white/70" : "text-[oklch(0.48_0.02_258)]",
                  )}
                >
                  {f}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div
        className={cn(
          "mt-5 px-5 pb-5 pt-4 flex items-center justify-end gap-2 border-t",
          isFeatured ? "border-white/10" : "border-[oklch(0.92_0.010_258)]",
        )}
      >
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${plan.name}`}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-colors",
            isFeatured
              ? "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              : "border border-[oklch(0.88_0.010_258)] text-[oklch(0.48_0.02_258)] hover:bg-[oklch(0.94_0.015_75)]",
          )}
        >
          <Pencil size={11} />
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${plan.name}`}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-colors",
            isFeatured
              ? "bg-white/10 text-white/50 hover:bg-red-500/20 hover:text-red-300"
              : "border border-[oklch(0.88_0.010_258)] text-[oklch(0.72_0.01_258)] hover:bg-red-50 hover:text-red-500 hover:border-red-200",
          )}
        >
          <Trash2 size={11} />
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Plans Table ───────────────────────────────────────────────────────────────

export function PlansTable({
  plans,
  serviceTypes = [],
  fetchError,
}: {
  plans: Plan[];
  serviceTypes?: ServiceType[];
  fetchError?: boolean;
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSuccess = useCallback(
    (action: "created" | "updated") => {
      toast.success(action === "created" ? "Plan created." : "Plan updated.");
      setShowCreate(false);
      setEditPlan(null);
      router.refresh();
    },
    [router],
  );

  const handleDeleted = useCallback(() => {
    toast.success("Plan deleted.");
    setConfirmDeleteId(null);
    router.refresh();
  }, [router]);

  return (
    <>
      {showCreate && (
        <PlanFormDialog
          plan={null}
          serviceTypes={serviceTypes}
          onClose={() => setShowCreate(false)}
          onSuccess={handleSuccess}
        />
      )}

      {editPlan && (
        <PlanFormDialog
          plan={editPlan}
          serviceTypes={serviceTypes}
          onClose={() => setEditPlan(null)}
          onSuccess={handleSuccess}
        />
      )}

      <div className="mb-8">
        <p className="text-[oklch(0.72_0.115_82)] text-xs font-semibold tracking-widest uppercase mb-1.5">
          Plans
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[oklch(0.24_0.055_258)] text-2xl font-bold tracking-tight">
              Membership Plans
            </h1>
            <span className="text-[oklch(0.48_0.02_258)] text-sm font-normal">
              {plans.length} {plans.length === 1 ? "plan" : "plans"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            aria-label="Create new plan"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-3 sm:px-3 sm:py-1.5 rounded-lg bg-[oklch(0.24_0.055_258)] text-[oklch(0.72_0.115_82)] text-xs font-semibold hover:bg-[oklch(0.32_0.050_258)] transition-colors sm:w-auto w-full"
          >
            <Plus size={13} />
            New plan
          </button>
        </div>
      </div>

      {fetchError && plans.length === 0 ? (
        <div className="rounded-xl border border-[oklch(0.88_0.010_258)] bg-[oklch(0.99_0.005_80)] px-4 py-16 text-center space-y-4">
          <p className="text-[oklch(0.72_0.01_258)] text-sm">
            Could not load plans. Check your connection or try refreshing.
          </p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[oklch(0.88_0.010_258)] text-[oklch(0.48_0.02_258)] text-xs font-medium hover:bg-[oklch(0.94_0.015_75)] transition-colors"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-[oklch(0.88_0.010_258)] bg-[oklch(0.99_0.005_80)] px-4 py-16 text-center">
          <p className="text-[oklch(0.72_0.01_258)] text-sm">
            No membership plans configured yet.
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[oklch(0.24_0.055_258)] text-[oklch(0.72_0.115_82)] text-xs font-semibold hover:bg-[oklch(0.32_0.050_258)] transition-colors"
          >
            <Plus size={13} />
            Create your first plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="relative">
              <div aria-hidden={confirmDeleteId === plan.id ? true : undefined}>
                <PlanCard
                  plan={plan}
                  onEdit={() => setEditPlan(plan)}
                  onDelete={() => setConfirmDeleteId(plan.id)}
                />
              </div>
              {confirmDeleteId === plan.id && (
                <div className="absolute inset-0 rounded-xl overflow-hidden">
                  <DeleteConfirmCard
                    plan={plan}
                    onCancel={() => setConfirmDeleteId(null)}
                    onDeleted={handleDeleted}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
