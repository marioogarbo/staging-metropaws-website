import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReservationsTable } from "@/components/admin/reservations-table";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://metropaws-backend.onrender.com";

export interface Reservation {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  barangay: string;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
}

export default async function AdminReservationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) redirect("/admin/login");

  let reservations: Reservation[] = [];
  try {
    const res = await fetch(`${BACKEND_URL}/admin/founding-reservations`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.ok) {
      reservations = await res.json();
    }
  } catch {
    // surface empty state
  }

  const pending = reservations.filter((r) => r.status === "pending").length;

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="text-[oklch(0.72_0.115_82)] text-sm font-semibold tracking-widest uppercase mb-1.5">
          Founding 50
        </p>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-[oklch(0.24_0.055_258)] text-2xl font-semibold tracking-tight">
            Reservations
          </h1>
          <span className="text-[oklch(0.48_0.02_258)] text-sm font-normal">
            {reservations.length} submitted
          </span>
          {pending > 0 && (
            <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-[oklch(0.90_0.040_80)] text-[oklch(0.40_0.060_82)]">
              {pending} pending
            </span>
          )}
        </div>
      </div>

      <ReservationsTable reservations={reservations} />
    </main>
  );
}
