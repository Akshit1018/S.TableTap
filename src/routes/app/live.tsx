import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RewardLadder } from "@/components/reward-ladder";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  getRestaurant,
  leaveQueue,
  listQueue,
  listRewards,
  myActiveQueue,
} from "@/lib/data/server";
import type { QueueEntry, Restaurant, WaitReward } from "@/lib/data/types";
import { cn, elapsedWaitMins, remainingWaitMins } from "@/lib/utils";

export const Route = createFileRoute("/app/live")({ component: Live });

const CACHE_KEY = "tabletap:active-queue";

function readCached(): QueueEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as QueueEntry) : null;
  } catch {
    return null;
  }
}

function writeCached(entry: QueueEntry | null) {
  if (typeof window === "undefined") return;
  try {
    if (entry) sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    else sessionStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}

function Live() {
  const { user, isPending } = useCurrentUserState();
  const [entry, setEntry] = useState<QueueEntry | null | undefined>(() => readCached() ?? undefined);
  const [rest, setRest] = useState<Restaurant | null>(null);
  const [rewards, setRewards] = useState<WaitReward[]>([]);
  const [ahead, setAhead] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const id = entry?.restaurantId;
    if (!id) return;
    let cancelled = false;
    getRestaurant({ data: id })
      .then((r) => {
        if (!cancelled && r) setRest(r);
      })
      .catch(() => undefined);
    listRewards({ data: id })
      .then((rw) => {
        if (!cancelled) setRewards(rw);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [entry?.restaurantId]);

  useEffect(() => {
    if (isPending || !user) return;
    let cancelled = false;
    const pull = async () => {
      try {
        const q = await myActiveQueue();
        if (cancelled) return;
        setEntry(q);
        writeCached(q);
        if (!q) {
          setRest(null);
          return;
        }
        try {
          const [r, rw, line] = await Promise.all([
            getRestaurant({ data: q.restaurantId }),
            listRewards({ data: q.restaurantId }),
            listQueue({ data: q.restaurantId }),
          ]);
          if (cancelled) return;
          setRest(r);
          setRewards(rw);
          const idx = line.findIndex((x) => x.id === q.id);
          setAhead(idx < 0 ? line.length : idx);
          const live = line.find((x) => x.id === q.id) ?? q;
          setEntry(live);
          writeCached(live);
        } catch {
          /* keep the active entry even if extras fail */
        }
      } catch {
        if (!cancelled && !readCached()) setEntry(null);
      }
    };
    void pull();
    const t = window.setInterval(() => void pull(), 3000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [user, isPending]);

  if (isPending || entry === undefined) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="size-16 animate-pulse rounded-full bg-surface-2" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;

  if (!entry) {
    return (
      <main className="flex flex-1 flex-col px-6 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <h1 className="font-display text-2xl font-medium tracking-tight">Live queue</h1>
        <p className="mt-2 text-sm text-muted">You’re not on a list right now.</p>
        <div className="mt-10 rounded-[28px] border border-border bg-surface p-6 text-center">
          <p className="text-sm text-muted">
            Join a waitlist from Discover. The quote, your place, and wait rewards will land here.
          </p>
          <Button asChild className="mt-5">
            <Link to="/app">Find a table</Link>
          </Button>
        </div>
      </main>
    );
  }

  const elapsed = elapsedWaitMins(entry.joinedAt);
  const remain = remainingWaitMins(entry.quotedWait, entry.joinedAt);
  const ready = entry.status === "ready" || remain === 0;
  const progress = Math.min(1, elapsed / Math.max(1, entry.quotedWait));
  const queueId = entry.id;
  void now;

  async function onLeave() {
    await leaveQueue({ data: queueId });
    writeCached(null);
    setEntry(null);
    toast.message("You left the list");
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <p className="text-xs font-medium uppercase tracking-wider text-subtle">
        {rest?.name ?? "Your room"}
      </p>
      <h1 className="font-display text-2xl font-medium tracking-tight">
        {ready ? "Your table is ready" : "You’re on the list"}
      </h1>

      <div
        className={cn(
          "mt-5 overflow-hidden rounded-[32px] border p-6 text-center",
          ready ? "border-primary/30 bg-primary-soft" : "border-border bg-surface",
        )}
      >
        <div className="relative mx-auto grid size-40 place-items-center">
          <svg viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-2" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-primary"
              strokeDasharray={`${progress * 327} 327`}
            />
          </svg>
          <div>
            <p className="font-display text-5xl font-medium tabular-nums leading-none tracking-tight">
              {ready ? 0 : remain}
            </p>
            <p className="mt-1 text-xs text-muted">{ready ? "minutes — now" : "min remaining"}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted">
          {ready
            ? "Come to the host stand. We’re holding the table."
            : `${ahead} ${ahead === 1 ? "party" : "parties"} ahead · quoted ${entry.quotedWait} min`}
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-subtle">
          <Bell className="size-3.5" />
          We’ll ping you when they tap Ready
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-lg font-medium tracking-tight">Wait rewards</h2>
        <span className="text-xs tabular-nums text-muted">{elapsed} min elapsed</span>
      </div>
      <p className="mb-3 mt-1 text-xs text-muted">
        The longer the house runs behind, the more they owe you. Unlocked perks sit in You.
      </p>
      <RewardLadder rewards={rewards} elapsedMins={elapsed} />

      <Link
        to="/app/you"
        className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
      >
        Open gifts & coupons
        <ChevronRight className="size-4 text-muted" />
      </Link>

      <Button variant="outline" className="mt-6 w-full" onClick={() => void onLeave()}>
        Leave the list
      </Button>
    </main>
  );
}
