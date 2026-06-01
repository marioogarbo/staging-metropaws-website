"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://metropaws-backend.onrender.com";

async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value ?? null;
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/admin/login");
}

export interface BarangayCount {
  barangay: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface DashboardSummary {
  totalMembers: number;
  foundingApproved: number;
  foundingPending: number;
  foundingRejected: number;
  totalClinics: number;
  petDogs: number;
  petCats: number;
  petOther: number;
  recentReservations: RecentReservation[];
}

export interface RecentReservation {
  id: string;
  first_name: string;
  last_name: string;
  barangay: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface RawMember {
  pets?: { species?: string | null }[];
}

interface RawReservation {
  id: string;
  first_name: string;
  last_name: string;
  barangay: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface RawClinic {
  id: string;
}

export async function fetchFoundingLocationAction(): Promise<BarangayCount[]> {
  const token = await getAdminToken();
  if (!token) return [];

  try {
    const res = await fetch(`${BACKEND_URL}/admin/analytics/founding-location`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchDashboardSummaryAction(): Promise<DashboardSummary> {
  const token = await getAdminToken();
  const empty: DashboardSummary = {
    totalMembers: 0,
    foundingApproved: 0,
    foundingPending: 0,
    foundingRejected: 0,
    totalClinics: 0,
    petDogs: 0,
    petCats: 0,
    petOther: 0,
    recentReservations: [],
  };
  if (!token) return empty;

  const headers = { Authorization: `Bearer ${token}` };
  const opts: RequestInit = { headers, cache: "no-store" };

  const [membersRes, reservationsRes, clinicsRes] = await Promise.all([
    fetch(`${BACKEND_URL}/admin/members?limit=500`, opts).catch(() => null),
    fetch(`${BACKEND_URL}/admin/founding-reservations`, opts).catch(() => null),
    fetch(`${BACKEND_URL}/admin/clinic-partners`, opts).catch(() => null),
  ]);

  const members: RawMember[] = membersRes?.ok
    ? await membersRes.json().catch(() => [])
    : [];
  const reservations: RawReservation[] = reservationsRes?.ok
    ? await reservationsRes.json().catch(() => [])
    : [];
  const clinics: RawClinic[] = clinicsRes?.ok
    ? await clinicsRes.json().catch(() => [])
    : [];

  let petDogs = 0;
  let petCats = 0;
  let petOther = 0;
  for (const m of members) {
    for (const p of m.pets ?? []) {
      const s = (p.species ?? "").toLowerCase();
      if (s === "dog") petDogs++;
      else if (s === "cat") petCats++;
      else if (s) petOther++;
    }
  }

  const approved = reservations.filter((r) => r.status === "approved").length;
  const pending = reservations.filter((r) => r.status === "pending").length;
  const rejected = reservations.filter((r) => r.status === "rejected").length;

  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      first_name: r.first_name,
      last_name: r.last_name,
      barangay: r.barangay,
      status: r.status,
      created_at: r.created_at,
    }));

  return {
    totalMembers: members.length,
    foundingApproved: approved,
    foundingPending: pending,
    foundingRejected: rejected,
    totalClinics: clinics.length,
    petDogs,
    petCats,
    petOther,
    recentReservations,
  };
}
