import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WellnessChecksTable } from "@/components/admin/wellness-checks-table";
import { BoothQrCard } from "@/components/admin/booth-qr-card";
import { ExportButton } from "@/components/admin/export-button";
import { EXPO_SOURCE } from "@/lib/wellness-scoring";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://metropaws-backend.onrender.com";

export interface WellnessCheck {
  id: string;
  answers: Record<string, string>;
  area_scores: Record<string, number>;
  total_score: number;
  band: string;
  pet_name: string | null;
  pet_type: string;
  annual_spend_bracket: string | null;
  owner_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  consent_given: boolean;
  source: string;
  created_at: string;
}

interface StatPillProps {
  label: string;
  count: number | string;
  highlighted?: boolean;
}

function StatPill({ label, count, highlighted }: StatPillProps) {
  if (highlighted) {
    return (
      <div className="flex items-baseline gap-1.5 px-3.5 py-2 rounded-lg border bg-[oklch(0.93_0.025_80)] border-[oklch(0.87_0.040_80)]">
        <span className="text-base font-bold tabular-nums leading-none text-[oklch(0.40_0.060_82)]">
          {count}
        </span>
        <span className="text-xs font-medium text-[oklch(0.52_0.055_82)]">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-baseline gap-1.5 px-3.5 py-2 rounded-lg border bg-[oklch(0.97_0.008_80)] border-[oklch(0.91_0.010_258)]">
      <span className="text-base font-bold tabular-nums leading-none text-[oklch(0.24_0.055_258)]">
        {count}
      </span>
      <span className="text-xs font-medium text-[oklch(0.55_0.018_258)]">{label}</span>
    </div>
  );
}

function WellnessChecksSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse motion-reduce:animate-none"
    >
      <div className="h-4 w-32 rounded bg-[oklch(0.93_0.010_258)]" />
      <div className="mt-3 h-7 w-52 rounded bg-[oklch(0.93_0.010_258)]" />
      <div className="mt-8 rounded-xl border border-[oklch(0.88_0.010_258)] bg-[oklch(0.99_0.005_80)] p-4">
        {Array.from({ length: 6 }, (_, row) => (
          <div
            key={row}
            className="h-10 border-b border-[oklch(0.94_0.008_258)] last:border-0"
          />
        ))}
      </div>
    </div>
  );
}

function averageScore(checks: WellnessCheck[]): string {
  if (!checks.length) return "0";
  const total = checks.reduce((sum, check) => sum + check.total_score, 0);
  return Math.round(total / checks.length).toString();
}

async function WellnessChecksContent({ token }: { token: string }) {
  let checks: WellnessCheck[] = [];
  let unauthorized = false;

  try {
    const res = await fetch(`${BACKEND_URL}/admin/wellness-checks`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      checks = await res.json();
    } else if (res.status === 401) {
      unauthorized = true;
    }
  } catch {
    // surface empty state
  }

  // redirect() throws, so it has to happen outside the try.
  if (unauthorized) redirect("/admin/login");

  const expo = checks.filter((check) => check.source === EXPO_SOURCE).length;
  const withContact = checks.filter(
    (check) => check.contact_phone || check.contact_email,
  ).length;

  return (
    <>
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div>
            <p className="text-[oklch(0.72_0.115_82)] text-xs font-semibold tracking-widest uppercase mb-2">
              Readiness check
            </p>
            <h1 className="text-[oklch(0.24_0.055_258)] text-2xl font-bold tracking-tight leading-tight">
              Wellness Checks
            </h1>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="flex gap-2.5 flex-wrap items-start">
              <StatPill label="Total" count={checks.length} />
              <StatPill label="Expo" count={expo} highlighted={expo > 0} />
              <StatPill label="Website" count={checks.length - expo} />
              <StatPill label="With contact" count={withContact} />
              <StatPill label="Avg score" count={averageScore(checks)} />
            </div>
            <ExportButton resource="wellness-checks" />
          </div>
        </div>
      </header>

      <BoothQrCard />

      <WellnessChecksTable checks={checks} />
    </>
  );
}

export default async function AdminWellnessChecksPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) redirect("/admin/login");

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Suspense rather than blocking the route on the fetch: on a cold Render
          instance this page is often the first request of the morning, and a
          blank screen for thirty seconds reads as broken. */}
      <Suspense fallback={<WellnessChecksSkeleton />}>
        <WellnessChecksContent token={token} />
      </Suspense>
    </main>
  );
}
