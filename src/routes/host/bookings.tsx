import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useHostVenue } from "@/components/host-venue";
import { hostBookings, setBookingStatus } from "@/lib/data/server";
import type { Booking } from "@/lib/data/types";
import { cn, formatClock, formatDay, formatInr } from "@/lib/utils";

export const Route = createFileRoute("/host/bookings")({ component: HostBookings });

function HostBookings() {
  const { venue, venueId } = useHostVenue();
  const [rows, setRows] = useState<Booking[] | null>(null);

  useEffect(() => {
    hostBookings({ data: venueId })
      .then(setRows)
      .catch(() => setRows([]));
  }, [venueId]);

  return (
    <main className="flex flex-1 flex-col px-5 pb-6 pt-[max(1.1rem,env(safe-area-inset-top))]">
      <p className="text-xs font-medium uppercase tracking-wider text-subtle">{venue?.name}</p>
      <h1 className="font-display text-2xl font-medium tracking-tight">Advance books</h1>
      <p className="mt-1 text-sm text-muted">Deposits already taken. Seat them like a reservation, not a walk-up.</p>

      {!rows ? (
        <div className="mt-6 h-32 animate-pulse rounded-[24px] bg-surface-2" />
      ) : rows.length === 0 ? (
        <p className="mt-10 rounded-[24px] border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          No deposits tonight. Guests can pre-book from the room page.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {rows.map((b) => (
            <li key={b.id} className="rounded-[22px] border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{b.guestName}</p>
                  <p className="text-xs text-muted">
                    {formatDay(b.slotAt)} · {formatClock(b.slotAt)} · {b.partySize} covers
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
                    b.status === "confirmed" && "bg-primary-soft text-primary",
                    b.status !== "confirmed" && "bg-surface-2 text-muted",
                  )}
                >
                  {b.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted">
                {b.depositAmount === 0 ? "No deposit" : formatInr(b.depositAmount)}
                {b.discountPct ? ` · ${b.discountPct}% off` : ""} · {b.perk}
              </p>
              {(b.status === "held" || b.status === "confirmed") && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={async () => {
                      await setBookingStatus({ data: { id: b.id, status: "completed" } });
                      setRows((cur) => cur?.map((x) => (x.id === b.id ? { ...x, status: "completed" } : x)) ?? null);
                      toast.success("Seated from the book");
                    }}
                  >
                    Seat
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await setBookingStatus({ data: { id: b.id, status: "cancelled" } });
                      setRows((cur) => cur?.map((x) => (x.id === b.id ? { ...x, status: "cancelled" } : x)) ?? null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
