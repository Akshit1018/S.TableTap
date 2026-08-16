import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Clock, MapPin, Minus, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RewardLadder } from "@/components/reward-ladder";
import {
  createBooking,
  getRestaurant,
  joinQueue,
  listRewards,
  listTiers,
} from "@/lib/data/server";
import type { DepositTier, Restaurant, WaitReward } from "@/lib/data/types";
import { cn, formatInr, priceMarks } from "@/lib/utils";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";

export const Route = createFileRoute("/app/restaurant/$id")({ component: RestaurantPage });

type Tab = "wait" | "book";

function RestaurantPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [rest, setRest] = useState<Restaurant | null | undefined>(undefined);
  const [rewards, setRewards] = useState<WaitReward[]>([]);
  const [tiers, setTiers] = useState<DepositTier[]>([]);
  const [tab, setTab] = useState<Tab>("wait");
  const [party, setParty] = useState(2);
  const [notes, setNotes] = useState("");
  const [tierId, setTierId] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [needAuth, setNeedAuth] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getRestaurant({ data: id }), listRewards({ data: id }), listTiers({ data: id })])
      .then(([r, rw, t]) => {
        if (cancelled) return;
        setRest(r);
        setRewards(rw);
        setTiers(t);
        const firstPaid = t.find((x) => x.amount > 0) ?? t[0];
        if (firstPaid) setTierId(firstPaid.id);
      })
      .catch(() => {
        if (!cancelled) setRest(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const slots = useMemo(() => buildSlots(), []);
  const selectedTier = tiers.find((t) => t.id === tierId);

  if (needAuth) return <RedirectToSignIn />;
  if (rest === undefined) {
    return (
      <main className="flex flex-1 flex-col">
        <div className="h-64 animate-pulse bg-surface-2" />
        <div className="p-5">
          <div className="h-8 w-48 animate-pulse rounded-full bg-surface-2" />
        </div>
      </main>
    );
  }
  if (!rest) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-muted">That room isn’t on the list.</p>
        <Button asChild variant="secondary">
          <Link to="/app">Back to discover</Link>
        </Button>
      </main>
    );
  }

  async function requireUser(): Promise<boolean> {
    if (isPending) return false;
    if (!user) {
      setNeedAuth(true);
      return false;
    }
    return true;
  }

  const restaurantId = rest.id;
  const maxParty = rest.partyMax;

  async function onJoin() {
    if (!(await requireUser())) return;
    setBusy(true);
    try {
      const joined = await joinQueue({
        data: {
          restaurantId,
          partySize: party,
          notes,
          guestName: user!.displayName ?? "Guest",
        },
      });
      try {
        sessionStorage.setItem("tabletap:active-queue", JSON.stringify(joined));
      } catch {
        /* ignore */
      }
      toast.success("You're on the list");
      await navigate({ to: "/app/live" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not join");
    } finally {
      setBusy(false);
    }
  }

  async function onBook() {
    if (!(await requireUser())) return;
    if (!tierId || !slot) {
      toast.error("Pick a time and a deposit tier");
      return;
    }
    setBusy(true);
    try {
      await createBooking({
        data: {
          restaurantId,
          partySize: party,
          slotAt: slot,
          depositTierId: tierId,
          guestName: user!.displayName ?? "Guest",
        },
      });
      toast.success(selectedTier && selectedTier.amount > 0 ? "Table held — deposit placed" : "Hold placed");
      await navigate({ to: "/app/bookings" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not book");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col pb-4">
      <div className="relative h-64">
        <img src={rest.coverImage} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-ink/25" />
        <Link
          to="/app"
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] grid size-11 place-items-center rounded-full bg-surface/90 text-fg"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div className="absolute bottom-4 left-5 right-5">
          <p className="text-xs text-primary-fg/80">
            {rest.cuisine} · {priceMarks(rest.priceLevel)} · {rest.rating.toFixed(1)}
          </p>
          <h1 className="font-display text-[2rem] font-medium leading-none tracking-tight text-primary-fg">
            {rest.name}
          </h1>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {rest.neighborhood}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="size-3.5" />
          {rest.waitingCount} waiting
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium text-primary tabular-nums">
          <Clock className="size-3.5" />
          {rest.waitMins} min quote
        </span>
      </div>

      <p className="px-5 text-sm leading-relaxed text-muted">{rest.description}</p>
      <p className="px-5 pt-1 text-xs text-subtle">{rest.hours} · {rest.address}</p>

      <div className="mx-5 mt-5 grid grid-cols-2 rounded-full bg-surface-2 p-1">
        {(["wait", "book"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "h-10 rounded-full text-sm font-medium",
              tab === t ? "bg-surface text-fg shadow-[var(--shadow-card)]" : "text-muted",
            )}
          >
            {t === "wait" ? "Join waitlist" : "Pre-book"}
          </button>
        ))}
      </div>

      <section className="mt-5 px-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-subtle">Party</p>
        <div className="flex items-center justify-between rounded-[20px] border border-border bg-surface px-4 py-3">
          <span className="text-sm">Guests</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full bg-surface-2"
              onClick={() => setParty((n) => Math.max(1, n - 1))}
            >
              <Minus className="size-4" />
            </button>
            <span className="w-6 text-center text-base font-medium tabular-nums">{party}</span>
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full bg-surface-2"
              onClick={() => setParty((n) => Math.min(maxParty, n + 1))}
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {tab === "wait" ? (
        <section className="mt-6 px-5">
          <h2 className="mb-2 font-display text-lg font-medium tracking-tight">If the wait runs long</h2>
          <p className="mb-3 text-xs text-muted">
            This house quotes {rest.waitMins} minutes. Around 30 you usually unlock a plate or a small percent off.
            Past 60, the house owes you a real discount or credit — applied automatically while you wait.
          </p>
          <RewardLadder rewards={rewards} elapsedMins={0} />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Allergies, high chair, celebration…"
            rows={2}
            className="mt-4 w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button size="lg" className="mt-4 w-full" disabled={busy} onClick={() => void onJoin()}>
            {busy ? "Joining…" : `Join the list · ${rest.waitMins} min`}
          </Button>
        </section>
      ) : (
        <section className="mt-6 px-5 pb-2">
          <h2 className="mb-2 font-display text-lg font-medium tracking-tight">Hold a table</h2>
          <p className="mb-3 text-xs text-muted">
            Pay a deposit now. Higher tiers skip more of the line and land a deeper discount.
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {slots.map((s) => (
              <button
                key={s.iso}
                type="button"
                onClick={() => setSlot(s.iso)}
                className={cn(
                  "h-16 shrink-0 rounded-2xl border px-3.5 text-left",
                  slot === s.iso ? "border-primary bg-primary-soft" : "border-border bg-surface",
                )}
              >
                <p className="text-[11px] text-muted">{s.day}</p>
                <p className="text-sm font-medium tabular-nums">{s.time}</p>
              </button>
            ))}
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {tiers.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTierId(t.id)}
                  className={cn(
                    "flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left",
                    tierId === t.id ? "border-primary bg-primary-soft" : "border-border bg-surface",
                  )}
                >
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted">{t.perk}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {t.amount === 0 ? "Free" : formatInr(t.amount)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Button size="lg" className="mt-4 w-full" disabled={busy} onClick={() => void onBook()}>
            {busy
              ? "Holding…"
              : selectedTier
                ? selectedTier.amount === 0
                  ? "Place a free hold"
                  : `Pay ${formatInr(selectedTier.amount)} to hold`
                : "Choose a tier"}
          </Button>
        </section>
      )}
    </main>
  );
}

function buildSlots() {
  const out: { iso: string; day: string; time: string }[] = [];
  const start = new Date();
  start.setMinutes(start.getMinutes() + 45, 0, 0);
  start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15);
  for (let i = 0; i < 10; i += 1) {
    const d = new Date(start.getTime() + i * 45 * 60 * 1000);
    out.push({
      iso: d.toISOString(),
      day: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
      time: d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
    });
  }
  return out;
}
