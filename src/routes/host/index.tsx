import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHostVenue } from "@/components/host-venue";
import {
  addWalkIn,
  hostStats,
  listQueue,
  listRewards,
  sendHostGift,
  setQueueStatus,
} from "@/lib/data/server";
import type { HostStats, QueueEntry, WaitReward } from "@/lib/data/types";
import { cn, elapsedWaitMins, remainingWaitMins } from "@/lib/utils";

export const Route = createFileRoute("/host/")({ component: HostFloor });

const GIFTS = [
  { title: "Complimentary dessert", description: "Chef sends a plate.", kind: "free_item", value: 0 },
  { title: "₹200 bar credit", description: "On the next round.", kind: "gift", value: 200 },
  { title: "Priority bump", description: "Move up one place.", kind: "gift", value: 0 },
  { title: "Chef’s tasting bite", description: "From the pass, now.", kind: "free_item", value: 0 },
];

function HostFloor() {
  const { venues, venue, venueId, setVenueId } = useHostVenue();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [stats, setStats] = useState<HostStats | null>(null);
  const [rewards, setRewards] = useState<WaitReward[]>([]);
  const [walkName, setWalkName] = useState("");
  const [walkSize, setWalkSize] = useState(2);
  const [giftFor, setGiftFor] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const pull = async () => {
      try {
        const [q, s, rw] = await Promise.all([
          listQueue({ data: venueId }),
          hostStats({ data: venueId }),
          listRewards({ data: venueId }),
        ]);
        if (cancelled) return;
        setQueue(q);
        setStats(s);
        setRewards(rw);
      } catch {
        /* auth flicker */
      }
    };
    void pull();
    const t = window.setInterval(() => void pull(), 2500);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [venueId]);

  const ready = queue.filter((q) => q.status === "ready");
  const waiting = queue.filter((q) => q.status === "waiting");

  return (
    <main className="flex flex-1 flex-col px-5 pb-4 pt-[max(1.1rem,env(safe-area-inset-top))]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-subtle">Tonight’s floor</p>
          <h1 className="font-display text-2xl font-medium tracking-tight">{venue?.name ?? "Floor"}</h1>
        </div>
        <label className="sr-only" htmlFor="venue">
          Venue
        </label>
        <select
          id="venue"
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          className="h-10 max-w-[9.5rem] rounded-full border border-border bg-surface px-3 text-xs font-medium"
        >
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Waiting" value={stats?.waiting ?? 0} />
        <Stat label="Ready" value={stats?.ready ?? 0} />
        <Stat label="Covers sat" value={stats?.coversTonight ?? 0} />
      </div>

      <form
        className="mt-5 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!walkName.trim()) return;
          await addWalkIn({ data: { restaurantId: venueId, guestName: walkName.trim(), partySize: walkSize } });
          setWalkName("");
          const q = await listQueue({ data: venueId });
          setQueue(q);
          toast.success("Walk-in added");
        }}
      >
        <Input
          value={walkName}
          onChange={(e) => setWalkName(e.target.value)}
          placeholder="Walk-in name"
          className="flex-1"
        />
        <input
          type="number"
          min={1}
          max={12}
          value={walkSize}
          onChange={(e) => setWalkSize(Number(e.target.value))}
          className="h-12 w-14 rounded-full border border-border bg-surface text-center text-sm tabular-nums"
        />
        <Button type="submit" variant="secondary">
          Add
        </Button>
      </form>

      {ready.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-subtle">Ready to sit</h2>
          <ul className="flex flex-col gap-2">
            {ready.map((q) => (
              <PartyCard
                key={q.id}
                entry={q}
                rewards={rewards}
                giftOpen={giftFor === q.id}
                onGift={() => setGiftFor(giftFor === q.id ? null : q.id)}
                onSendGift={async (g) => {
                  await sendHostGift({
                    data: {
                      restaurantId: venueId,
                      userId: q.userId,
                      title: g.title,
                      description: g.description,
                      kind: g.kind,
                      value: g.value,
                    },
                  });
                  setGiftFor(null);
                  toast.success(`Gift sent to ${q.guestName}`);
                }}
                onReady={() => undefined}
                onSeat={async () => {
                  await setQueueStatus({ data: { id: q.id, status: "seated" } });
                  setQueue((cur) => cur.filter((x) => x.id !== q.id));
                }}
                onNoShow={async () => {
                  await setQueueStatus({ data: { id: q.id, status: "no_show" } });
                  setQueue((cur) => cur.filter((x) => x.id !== q.id));
                }}
              />
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-subtle">Waiting</h2>
        {waiting.length === 0 ? (
          <p className="rounded-[22px] border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            The list is clear.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {waiting.map((q) => (
              <PartyCard
                key={q.id}
                entry={q}
                rewards={rewards}
                giftOpen={giftFor === q.id}
                onGift={() => setGiftFor(giftFor === q.id ? null : q.id)}
                onSendGift={async (g) => {
                  await sendHostGift({
                    data: {
                      restaurantId: venueId,
                      userId: q.userId,
                      title: g.title,
                      description: g.description,
                      kind: g.kind,
                      value: g.value,
                    },
                  });
                  setGiftFor(null);
                  toast.success(`Gift sent to ${q.guestName}`);
                }}
                onReady={async () => {
                  await setQueueStatus({ data: { id: q.id, status: "ready" } });
                  setQueue((cur) => cur.map((x) => (x.id === q.id ? { ...x, status: "ready" } : x)));
                }}
                onSeat={async () => {
                  await setQueueStatus({ data: { id: q.id, status: "seated" } });
                  setQueue((cur) => cur.filter((x) => x.id !== q.id));
                }}
                onNoShow={async () => {
                  await setQueueStatus({ data: { id: q.id, status: "no_show" } });
                  setQueue((cur) => cur.filter((x) => x.id !== q.id));
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[20px] border border-border bg-surface px-3 py-3">
      <p className="font-display text-2xl font-medium tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-muted">{label}</p>
    </div>
  );
}

function PartyCard({
  entry,
  rewards,
  giftOpen,
  onGift,
  onSendGift,
  onReady,
  onSeat,
  onNoShow,
}: {
  entry: QueueEntry;
  rewards: WaitReward[];
  giftOpen: boolean;
  onGift: () => void;
  onSendGift: (g: (typeof GIFTS)[number]) => void;
  onReady: () => void;
  onSeat: () => void;
  onNoShow: () => void;
}) {
  const rawElapsed = elapsedWaitMins(entry.joinedAt);
  const elapsed = entry.status === "ready" ? entry.quotedWait : Math.min(rawElapsed, entry.quotedWait);
  const remain = entry.status === "ready" ? 0 : remainingWaitMins(entry.quotedWait, entry.joinedAt);
  const unlocked = useMemo(
    () => rewards.filter((r) => rawElapsed >= r.minWaitMins).at(-1),
    [rewards, rawElapsed],
  );

  return (
    <li className="rounded-[22px] border border-border bg-surface p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{entry.guestName}</p>
          <p className="text-xs text-muted">
            Party of {entry.partySize}
            {entry.notes ? ` · ${entry.notes}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className={cn("text-sm font-medium tabular-nums", remain === 0 ? "text-primary" : "text-fg")}>
            {entry.status === "ready" ? "Ready" : `${remain}m left`}
          </p>
          <p className="text-[11px] tabular-nums text-subtle">{elapsed}m waited</p>
        </div>
      </div>
      {unlocked && (
        <p className="mt-2 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary">
          Unlocked: {unlocked.title}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {entry.status === "waiting" && (
          <Button size="sm" onClick={onReady}>
            Table ready
          </Button>
        )}
        <Button size="sm" variant={entry.status === "ready" ? "primary" : "secondary"} onClick={onSeat}>
          Seat
        </Button>
        <Button size="sm" variant="outline" onClick={onGift}>
          Gift
        </Button>
        <Button size="sm" variant="ghost" onClick={onNoShow}>
          No-show
        </Button>
      </div>
      {giftOpen && (
        <ul className="mt-3 grid grid-cols-2 gap-1.5">
          {GIFTS.map((g) => (
            <li key={g.title}>
              <button
                type="button"
                onClick={() => onSendGift(g)}
                className="h-full w-full rounded-2xl border border-border bg-bg px-2.5 py-2 text-left text-[11px] leading-snug"
              >
                <span className="block font-medium">{g.title}</span>
                <span className="text-muted">{g.description}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
