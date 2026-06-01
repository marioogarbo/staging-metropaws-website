"use client";

import {
  useActionState,
  useState,
  useTransition,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  StickyNote,
  BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  updateReservationStatusAction,
  type ActionState,
} from "@/app/admin/(protected)/reservations/actions";
import type { Reservation } from "@/app/admin/(protected)/reservations/page";

// ── Status helpers ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-[oklch(0.93_0.020_80)] text-[oklch(0.45_0.060_80)] border border-[oklch(0.88_0.030_80)]",
  approved:
    "bg-[oklch(0.93_0.040_155)] text-[oklch(0.35_0.090_155)] border border-[oklch(0.85_0.060_155)]",
  rejected:
    "bg-[oklch(0.93_0.030_25)] text-[oklch(0.40_0.090_25)] border border-[oklch(0.87_0.050_25)]",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={13} />,
  approved: <CheckCircle size={13} />,
  rejected: <XCircle size={13} />,
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium capitalize",
        STATUS_STYLES[status] ?? "bg-[oklch(0.94_0.015_75)] text-[oklch(0.48_0.02_258)]",
      )}
    >
      {STATUS_ICONS[status]}
      {status}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10)
    return `+63 ${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
  return phone;
}

// ── Filter tabs ─────────────────────────────────────────────────────────────

type FilterKey = "all" | "pending" | "approved" | "rejected";

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
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-[oklch(0.24_0.055_258)] text-white"
          : "text-[oklch(0.48_0.02_258)] hover:text-[oklch(0.24_0.055_258)] hover:bg-[oklch(0.94_0.015_75)]",
      )}
    >
      {label}
      <span
        className={cn(
          "px-1.5 py-0.5 rounded-full text-sm font-semibold leading-none",
          active
            ? "bg-white/20 text-white"
            : "bg-[oklch(0.90_0.010_258)] text-[oklch(0.48_0.02_258)]",
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ── Row expansion + status update ───────────────────────────────────────────

function ReservationRow({ reservation }: { reservation: Reservation }) {
  const [expanded, setExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState(reservation.status);
  const [adminNote, setAdminNote] = useState(reservation.admin_notes ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const wasPendingRef = useRef(false);

  const [state, formAction] = useActionState<ActionState, FormData>(
    updateReservationStatusAction,
    { error: null },
  );

  useEffect(() => {
    if (wasPendingRef.current && !isPending && state.error === null) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(t);
    }
    wasPendingRef.current = isPending;
  }, [isPending, state.error]);

  const fullName = `${reservation.first_name} ${reservation.last_name}`;
  const initials = (reservation.first_name[0] + reservation.last_name[0]).toUpperCase();
  const detailId = `reservation-detail-${reservation.id}`;

  return (
    <>
      {/* Main row */}
      <tr
        className={cn(
          "border-b border-[oklch(0.92_0.010_258)] transition-colors",
          expanded ? "bg-[oklch(0.97_0.008_80)]" : "hover:bg-[oklch(0.98_0.006_80)]",
        )}
      >
        {/* Name */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[oklch(0.32_0.050_258)] flex items-center justify-center shrink-0">
              <span className="text-[oklch(0.72_0.115_82)] text-sm font-semibold">
                {initials}
              </span>
            </div>
            <div>
              <p className="text-[oklch(0.24_0.055_258)] text-sm font-medium leading-none">
                {fullName}
              </p>
              <p className="text-[oklch(0.72_0.010_258)] text-sm mt-0.5">
                {reservation.barangay}
              </p>
            </div>
          </div>
        </td>

        {/* Contact */}
        <td className="px-4 py-3">
          <p className="text-[oklch(0.45_0.025_258)] text-sm">{reservation.email}</p>
          {reservation.phone && (
            <p className="text-[oklch(0.72_0.010_258)] text-sm mt-0.5">
              {formatPhone(reservation.phone)}
            </p>
          )}
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <StatusBadge status={localStatus} />
        </td>

        {/* Date */}
        <td className="px-4 py-3">
          <p className="text-[oklch(0.48_0.02_258)] text-sm tabular-nums">
            {formatDate(reservation.created_at)}
          </p>
        </td>

        {/* Expand toggle */}
        <td className="px-4 py-3 text-right">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-[oklch(0.48_0.02_258)] hover:text-[oklch(0.24_0.055_258)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.115_82)] rounded"
            aria-expanded={expanded}
            aria-controls={detailId}
          >
            {expanded ? (
              <>
                Collapse <ChevronUp size={13} />
              </>
            ) : (
              <>
                Details <ChevronDown size={13} />
              </>
            )}
          </button>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b border-[oklch(0.92_0.010_258)] bg-[oklch(0.97_0.008_80)]">
          <td
            colSpan={5}
            className="px-6 pt-5 pb-6 border-t border-[oklch(0.90_0.010_258)]"
          >
            <div id={detailId} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: full details */}
              <div className="space-y-5">
                <DetailRow
                  icon={<Mail size={12} />}
                  label="Email"
                  value={reservation.email}
                />
                <DetailRow
                  icon={<Phone size={12} />}
                  label="Phone"
                  value={formatPhone(reservation.phone) ?? "—"}
                />
                <DetailRow
                  icon={<MapPin size={12} />}
                  label="Barangay"
                  value={reservation.barangay}
                />
                <DetailRow
                  icon={<MessageSquare size={12} />}
                  label="Message"
                  value={reservation.message ?? "—"}
                  multiline
                />
              </div>

              {/* Right: status management */}
              <form
                action={(fd) => {
                  startTransition(() => formAction(fd));
                }}
                className="space-y-4"
              >
                <input type="hidden" name="reservationId" value={reservation.id} />

                {/* Status select */}
                <div>
                  <label
                    htmlFor={`status-${reservation.id}`}
                    className="flex items-center gap-1.5 text-[oklch(0.48_0.02_258)] text-sm font-semibold uppercase tracking-wider mb-1.5"
                  >
                    <Clock size={12} />
                    Status
                  </label>
                  <div className="relative">
                    <select
                      id={`status-${reservation.id}`}
                      name="status"
                      value={localStatus}
                      onChange={(e) =>
                        setLocalStatus(
                          e.target.value as "pending" | "approved" | "rejected",
                        )
                      }
                      disabled={isPending}
                      className="w-full appearance-none text-sm border border-[oklch(0.88_0.010_258)] rounded-lg px-3 py-2 pr-8 bg-[oklch(0.99_0.005_80)] text-[oklch(0.24_0.055_258)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.72_0.115_82)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[oklch(0.72_0.010_258)] pointer-events-none"
                    />
                  </div>
                </div>

                {/* Admin notes */}
                <div>
                  <label
                    htmlFor={`notes-${reservation.id}`}
                    className="flex items-center gap-1.5 text-[oklch(0.48_0.02_258)] text-sm font-semibold uppercase tracking-wider mb-1.5"
                  >
                    <StickyNote size={12} />
                    Admin Notes
                  </label>
                  <textarea
                    id={`notes-${reservation.id}`}
                    name="admin_notes"
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Optional internal notes..."
                    disabled={isPending}
                    className="w-full text-sm border border-[oklch(0.88_0.010_258)] rounded-lg px-3 py-2 bg-[oklch(0.99_0.005_80)] text-[oklch(0.24_0.055_258)] placeholder:text-[oklch(0.72_0.010_258)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.72_0.115_82)] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {state.error && (
                  <p className="text-[oklch(0.40_0.090_25)] text-sm">{state.error}</p>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 rounded-lg bg-[oklch(0.24_0.055_258)] text-white text-sm font-semibold hover:bg-[oklch(0.30_0.052_258)] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.72_0.115_82)]"
                  >
                    {isPending ? "Saving..." : "Save changes"}
                  </button>
                  <span
                    aria-live="polite"
                    role="status"
                    className="flex items-center gap-1 text-[oklch(0.35_0.090_155)] text-sm font-medium"
                  >
                    {saved && !isPending && (
                      <>
                        <CheckCircle size={12} />
                        Saved
                      </>
                    )}
                  </span>
                </div>
              </form>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
  multiline = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[oklch(0.48_0.02_258)] text-sm font-semibold uppercase tracking-wider mb-1">
        {icon}
        {label}
      </p>
      <p
        className={cn(
          "text-[oklch(0.24_0.055_258)] text-sm",
          multiline && "whitespace-pre-wrap",
        )}
      >
        {value}
      </p>
    </div>
  );
}

// ── Main table component ─────────────────────────────────────────────────────

export function ReservationsTable({ reservations }: { reservations: Reservation[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      all: reservations.length,
      pending: reservations.filter((r) => r.status === "pending").length,
      approved: reservations.filter((r) => r.status === "approved").length,
      rejected: reservations.filter((r) => r.status === "rejected").length,
    }),
    [reservations],
  );

  const filtered = useMemo(
    () =>
      reservations.filter((r) => {
        const matchesFilter = filter === "all" || r.status === filter;
        if (!query.trim()) return matchesFilter;

        const q = query.toLowerCase();
        const matchesSearch =
          r.first_name.toLowerCase().includes(q) ||
          r.last_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.barangay.toLowerCase().includes(q) ||
          (r.phone ?? "").includes(q);

        return matchesFilter && matchesSearch;
      }),
    [reservations, filter, query],
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-1 flex-wrap">
          {(["all", "pending", "approved", "rejected"] as FilterKey[]).map((key) => (
            <FilterTab
              key={key}
              label={key === "all" ? "All" : key.charAt(0).toUpperCase() + key.slice(1)}
              count={counts[key]}
              active={filter === key}
              onClick={() => setFilter(key)}
            />
          ))}
        </div>

        <div className="relative max-w-xs w-full sm:w-64">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[oklch(0.72_0.010_258)] pointer-events-none"
          />
          <input
            type="search"
            placeholder="Search name, email, barangay..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-[oklch(0.88_0.010_258)] rounded-lg bg-[oklch(0.99_0.005_80)] text-[oklch(0.24_0.055_258)] placeholder:text-[oklch(0.72_0.010_258)] focus:outline-none focus:ring-2 focus:ring-[oklch(0.72_0.115_82)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[oklch(0.88_0.010_258)] overflow-hidden bg-[oklch(0.99_0.005_80)]">
        {filtered.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[oklch(0.94_0.015_75)] flex items-center justify-center">
              <BookMarked size={16} className="text-[oklch(0.72_0.010_258)]" />
            </div>
            <div>
              <p className="text-[oklch(0.48_0.02_258)] text-sm font-medium">
                {reservations.length === 0 ? "No reservations yet" : "No results found"}
              </p>
              <p className="text-[oklch(0.72_0.010_258)] text-sm mt-1">
                {reservations.length === 0
                  ? "Founding 50 applications will appear here once submitted."
                  : "Try adjusting your search or filter."}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[oklch(0.92_0.010_258)] bg-[oklch(0.97_0.008_80)]">
                  <th className="px-4 py-3 text-[oklch(0.48_0.02_258)] text-sm font-semibold uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-4 py-3 text-[oklch(0.48_0.02_258)] text-sm font-semibold uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-[oklch(0.48_0.02_258)] text-sm font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[oklch(0.48_0.02_258)] text-sm font-semibold uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-4 py-3 w-28" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((reservation) => (
                  <ReservationRow key={reservation.id} reservation={reservation} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-[oklch(0.72_0.010_258)] text-sm text-right tabular-nums">
          Showing {filtered.length} of {reservations.length} reservations
        </p>
      )}
    </div>
  );
}
