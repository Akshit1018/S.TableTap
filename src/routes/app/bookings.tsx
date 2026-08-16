import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cancelBooking, myBookings } from "@/lib/data/server";
import type { Booking } from "@/lib/data/types";
import { cn, formatClock, formatDay, formatInr } from "@/lib/utils";

export const Route = createFileRoute("/app/bookings")({ component: BookingsPage });

function BookingsPage() {
  const { user, isPending } = useCurrentUserState();
  const [rows, setRows] = useState<Booking[] | null>(null);

  useEffect(() => {
    if (isPending || !user) return;
    myBookings()
      .then(setRows)
      .catch(() => setRows([]));
  }, [user, isPending]);

  if (isPending) {
    return <main className="flex flex-1 flex-col p-6"><div className="h-32 animate-pulse rounded-[28px] bg-surface-2" /></main>;
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <main className="flex flex-1 flex-col px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <h1 className="font-display text-2xl font-medium tracking-tight">Booked tables</h1>
      <p className="mt-1 text-sm text-muted">Advance holds, deposits, and the coupon each tier left you.</p>

      {!rows ? (
        <div className="mt-6 h-36 animate-pulse rounded-[28px] bg-surface-2" />
      ) : rows.length === 0 ? (
        <div className="mt-10 rounded-[28px] border border-border bg-surface p-6 text-center">
          <p className="text-sm text-muted">No holds yet. Pre-book with a deposit to skip more of the line.</p>
          <Button asChild className="mt-5">
            <Link to="/app">Browse rooms</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {rows.map((b) => (
            <li key={b.id} className="rounded-[24px] border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{b.restaurantName}</p>
                  <p className="text-sm text-muted">
                    {formatDay(b.slotAt)} · {formatClock(b.slotAt)} · {b.partySize} guests
                  </p>
                </div>
                <StatusChip status={b.status} />
              </div>
              <p className="mt-3 text-xs text-muted">
                {b.depositAmount === 0 ? "Free hold" : `${formatInr(b.depositAmount)} deposit`}
                {b.discountPct > 0 ? ` · ${b.discountPct}% off` : ""}
                {b.perk ? ` · ${b.perk}` : ""}
              </p>
              {(b.status === "held" || b.status === "confirmed") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={async () => {
                    await cancelBooking({ data: b.id });
                    setRows((cur) => cur?.map((x) => (x.id === b.id ? { ...x, status: "cancelled" } : x)) ?? null);
                    toast.message("Booking cancelled");
                  }}
                >
                  Cancel
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function StatusChip({ status }: { status: Booking["status"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
        status === "confirmed" && "bg-primary-soft text-primary",
        status === "held" && "bg-surface-2 text-muted",
        status === "cancelled" && "bg-surface-2 text-subtle",
        status === "completed" && "bg-surface-2 text-muted",
      )}
    >
      {status}
    </span>
  );
}
