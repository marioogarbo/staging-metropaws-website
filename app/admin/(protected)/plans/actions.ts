"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://metropaws-backend.onrender.com";

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value ?? null;
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export type ActionState = { error: string | null };

function parseNonNegativeInt(raw: string): number | null {
  if (!raw || !raw.trim()) return null;
  const n = parseInt(raw.trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const MAX_CAP_CENTAVOS = 100_000_000; // ₱1,000,000

const MAX_SESSIONS = 365;

type ServiceCap = {
  service_type_id: string;
  reimbursement_cap_centavos: number;
  sessions?: number;
};

/**
 * Parse the hidden `service_caps` field: a JSON array of
 * `{ service_type_id, peso, sessions? }` where `peso` is the admin-typed amount
 * (may contain commas / decimals). Converts pesos → integer centavos and
 * validates the range. `sessions` is only present for newly added categories.
 */
function parseServiceCaps(raw: string): ServiceCap[] | { error: string } {
  if (!raw || !raw.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Could not parse reimbursement caps." };
  }
  if (!Array.isArray(parsed)) return { error: "Invalid reimbursement caps format." };

  const caps: ServiceCap[] = [];
  for (const entry of parsed as unknown[]) {
    if (typeof entry !== "object" || entry === null) continue;
    const { service_type_id, peso, sessions } = entry as {
      service_type_id?: unknown;
      peso?: unknown;
      sessions?: unknown;
    };
    if (typeof service_type_id !== "string" || !service_type_id) continue;

    const pesoStr = String(peso ?? "").replace(/[,\s]/g, "");
    const pesos = pesoStr === "" ? 0 : Number(pesoStr);
    if (!Number.isFinite(pesos) || pesos < 0) {
      return { error: "Reimbursement caps must be amounts of ₱0 or greater." };
    }
    const centavos = Math.round(pesos * 100);
    if (centavos > MAX_CAP_CENTAVOS) {
      return { error: "A reimbursement cap exceeds the ₱1,000,000 maximum." };
    }

    const cap: ServiceCap = { service_type_id, reimbursement_cap_centavos: centavos };
    if (sessions !== undefined && sessions !== null && String(sessions).trim() !== "") {
      const s = Number(String(sessions).trim());
      if (!Number.isInteger(s) || s < 0 || s > MAX_SESSIONS) {
        return { error: `Sessions must be a whole number between 0 and ${MAX_SESSIONS}.` };
      }
      cap.sessions = s;
    }
    caps.push(cap);
  }
  return caps;
}

function parseFeatures(raw: string): string[] | { error: string } {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return { error: "Invalid features format." };
    return (parsed as unknown[])
      .filter((f): f is string => typeof f === "string")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    return { error: "Could not parse features." };
  }
}

async function safeFetch(url: string, options: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, options);
  } catch {
    return null;
  }
}

function apiErrorMessage(res: Response, detail: string | undefined, fallback: string): string {
  if (res.status === 401) return "Session expired. Please log in again.";
  return detail ?? fallback;
}

export async function createPlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { error: "Not authenticated." };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Plan name is required." };

  const price = parseNonNegativeInt(formData.get("price") as string);
  if (price === null) return { error: "Annual price must be a valid number (0 or greater)." };

  const priceMonthlyRaw = (formData.get("price_monthly") as string)?.trim();
  const priceMonthly = priceMonthlyRaw ? parseNonNegativeInt(priceMonthlyRaw) : null;
  if (priceMonthlyRaw && priceMonthly === null)
    return { error: "Monthly price must be a valid number (0 or greater)." };

  const featuresResult = parseFeatures(formData.get("features") as string);
  if ("error" in featuresResult) return { error: featuresResult.error };

  const sortOrderRaw = (formData.get("sort_order") as string) || "0";
  const sortOrder = parseNonNegativeInt(sortOrderRaw) ?? 0;

  const body = {
    name,
    price,
    price_monthly: priceMonthly,
    tagline: (formData.get("tagline") as string)?.trim() || null,
    features: featuresResult,
    is_featured: formData.get("is_featured") === "true",
    is_active: formData.get("is_active") === "true",
    sort_order: sortOrder,
  };

  const res = await safeFetch(`${BACKEND_URL}/admin/plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify(body),
  });

  if (!res) return { error: "Network error. Check your connection and try again." };

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    return { error: apiErrorMessage(res, err.detail, "Failed to create plan.") };
  }

  revalidatePath("/admin/plans");
  return { error: null };
}

export async function updatePlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { error: "Not authenticated." };

  const planId = (formData.get("planId") as string)?.trim();
  if (!planId) return { error: "Plan ID is missing." };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Plan name is required." };

  const price = parseNonNegativeInt(formData.get("price") as string);
  if (price === null) return { error: "Annual price must be a valid number (0 or greater)." };

  const priceMonthlyRaw = (formData.get("price_monthly") as string)?.trim();
  const priceMonthly = priceMonthlyRaw ? parseNonNegativeInt(priceMonthlyRaw) : null;
  if (priceMonthlyRaw && priceMonthly === null)
    return { error: "Monthly price must be a valid number (0 or greater)." };

  const featuresResult = parseFeatures(formData.get("features") as string);
  if ("error" in featuresResult) return { error: featuresResult.error };

  const capsResult = parseServiceCaps(formData.get("service_caps") as string);
  if ("error" in capsResult) return { error: capsResult.error };

  const sortOrderRaw = (formData.get("sort_order") as string) || "0";
  const sortOrder = parseNonNegativeInt(sortOrderRaw) ?? 0;

  const body = {
    name,
    price,
    price_monthly: priceMonthly,
    tagline: (formData.get("tagline") as string)?.trim() || null,
    features: featuresResult,
    is_featured: formData.get("is_featured") === "true",
    is_active: formData.get("is_active") === "true",
    sort_order: sortOrder,
    ...(capsResult.length > 0 ? { service_caps: capsResult } : {}),
  };

  const res = await safeFetch(`${BACKEND_URL}/admin/plans/${planId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader(token) },
    body: JSON.stringify(body),
  });

  if (!res) return { error: "Network error. Check your connection and try again." };

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    return { error: apiErrorMessage(res, err.detail, "Failed to update plan.") };
  }

  revalidatePath("/admin/plans");
  return { error: null };
}

export async function deletePlanAction(planId: string): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { error: "Not authenticated." };

  if (!planId?.trim()) return { error: "Plan ID is missing." };

  const res = await safeFetch(`${BACKEND_URL}/admin/plans/${planId}`, {
    method: "DELETE",
    headers: authHeader(token),
  });

  if (!res) return { error: "Network error. Check your connection and try again." };

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    return { error: apiErrorMessage(res, err.detail, "Failed to delete plan.") };
  }

  revalidatePath("/admin/plans");
  return { error: null };
}
