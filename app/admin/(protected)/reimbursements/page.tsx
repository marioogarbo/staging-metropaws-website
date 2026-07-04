import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReimbursementsTable } from "@/components/admin/reimbursements-table";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://metropaws-backend.onrender.com";

export interface ReimbursementServiceType {
  id: string;
  name: string;
  description: string | null;
  icon: string;
}

export interface ReimbursementEvent {
  id: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_at: string;
}

export interface ReimbursementMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  plan_type: string | null;
  payout_method: string | null;
  payout_account_name: string | null;
  payout_account_number: string | null;
  payout_bank_name: string | null;
}

export interface ReimbursementPet {
  id: string;
  name: string;
  species: string | null;
  photo_url: string | null;
}

export type ReimbursementStatus =
  | "pending"
  | "under_review"
  | "needs_info"
  | "approved"
  | "rejected"
  | "paid";

export interface AdminReimbursement {
  id: string;
  pet_id: string;
  service_type: ReimbursementServiceType;
  provider_name: string;
  service_date: string;
  claimed_amount_centavos: number;
  approved_amount_centavos: number | null;
  receipt_url: string;
  receipt_reference: string | null;
  member_notes: string | null;
  status: ReimbursementStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  paid_at: string | null;
  paid_reference: string | null;
  created_at: string;
  member: ReimbursementMember;
  pet: ReimbursementPet;
  events: ReimbursementEvent[];
}

interface StatPillProps {
  label: string;
  count: number;
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

export default async function AdminReimbursementsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) redirect("/admin/login");

  let claims: AdminReimbursement[] = [];
  try {
    const res = await fetch(`${BACKEND_URL}/admin/reimbursements?limit=300`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      claims = await res.json();
    }
  } catch {
    // surface empty state
  }

  const toReview = claims.filter((c) =>
    ["pending", "under_review", "needs_info"].includes(c.status),
  ).length;
  const approved = claims.filter((c) => c.status === "approved").length;
  const paid = claims.filter((c) => c.status === "paid").length;
  const rejected = claims.filter((c) => c.status === "rejected").length;

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div>
            <p className="text-[oklch(0.72_0.115_82)] text-xs font-semibold tracking-widest uppercase mb-2">
              Member benefits
            </p>
            <h1 className="text-[oklch(0.24_0.055_258)] text-2xl font-bold tracking-tight leading-tight">
              Reimbursements
            </h1>
          </div>
          <div className="flex gap-2.5 flex-wrap items-start">
            <StatPill label="Total" count={claims.length} />
            <StatPill label="To review" count={toReview} highlighted={toReview > 0} />
            <StatPill label="Approved" count={approved} />
            <StatPill label="Paid" count={paid} />
            <StatPill label="Rejected" count={rejected} />
          </div>
        </div>
      </header>

      <ReimbursementsTable claims={claims} />
    </main>
  );
}
