import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RewardLadder } from "@/components/reward-ladder";
import { useHostVenue } from "@/components/host-venue";
import {
  deleteReward,
  deleteTier,
  listRewards,
  listTiers,
  updateWaitMins,
  upsertReward,
  upsertTier,
} from "@/lib/data/server";
import type { DepositTier, WaitReward } from "@/lib/data/types";
import { formatInr } from "@/lib/utils";

export const Route = createFileRoute("/host/perks")({ component: HostPerks });

function HostPerks() {
  const { venue, venueId } = useHostVenue();
  const [rewards, setRewards] = useState<WaitReward[]>([]);
  const [tiers, setTiers] = useState<DepositTier[]>([]);
  const [wait, setWait] = useState(venue?.waitMins ?? 30);
  const [mins, setMins] = useState(30);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<WaitReward["kind"]>("discount_pct");
  const [value, setValue] = useState(10);
  const [tierName, setTierName] = useState("");
  const [tierAmount, setTierAmount] = useState(299);
  const [tierDiscount, setTierDiscount] = useState(12);
  const [tierPerk, setTierPerk] = useState("");

  useEffect(() => {
    setWait(venue?.waitMins ?? 30);
  }, [venue?.waitMins]);

  useEffect(() => {
    Promise.all([listRewards({ data: venueId }), listTiers({ data: venueId })])
      .then(([rw, t]) => {
        setRewards(rw);
        setTiers(t);
      })
      .catch(() => {
        setRewards([]);
        setTiers([]);
      });
  }, [venueId]);

  return (
    <main className="flex flex-1 flex-col px-5 pb-8 pt-[max(1.1rem,env(safe-area-inset-top))]">
      <p className="text-xs font-medium uppercase tracking-wider text-subtle">{venue?.name}</p>
      <h1 className="font-display text-2xl font-medium tracking-tight">Wait & book perks</h1>
      <p className="mt-1 text-sm text-muted">
        Pay guests back for time. Thirty minutes might mean a plate. Past an hour, a real discount.
      </p>

      <section className="mt-6 rounded-[24px] border border-border bg-surface p-4">
        <p className="text-sm font-medium">Quoted wait right now</p>
        <p className="mt-0.5 text-xs text-muted">New joiners see this number. The ladder still unlocks on elapsed time.</p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={90}
            value={wait}
            onChange={(e) => setWait(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="w-12 text-right text-sm font-medium tabular-nums">{wait}m</span>
        </div>
        <Button
          size="sm"
          className="mt-3"
          onClick={async () => {
            await updateWaitMins({ data: { restaurantId: venueId, waitMins: wait } });
            toast.success("Quote updated for new joiners");
          }}
        >
          Publish quote
        </Button>
      </section>

      <h2 className="mb-1 mt-8 font-display text-lg font-medium tracking-tight">Wait ladder</h2>
      <p className="mb-3 text-xs text-muted">
        Typical house: 20–30 min a small discount or free item. 45–60 min a credit or a real percent off.
      </p>
      <RewardLadder rewards={rewards} elapsedMins={999} />

      <form
        className="mt-4 flex flex-col gap-2 rounded-[24px] border border-border bg-surface p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) return;
          await upsertReward({
            data: {
              restaurantId: venueId,
              minWaitMins: mins,
              kind,
              value,
              title: title.trim(),
              description:
                kind === "discount_pct"
                  ? `${value}% after ${mins} minutes.`
                  : kind === "gift"
                    ? `₹${value} credit after ${mins} minutes.`
                    : `Unlocked at ${mins} minutes.`,
            },
          });
          setTitle("");
          setRewards(await listRewards({ data: venueId }));
          toast.success("Rung added");
        }}
      >
        <p className="text-sm font-medium">Add a wait rung</p>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Free dessert at 30 min" />
        <div className="grid grid-cols-3 gap-2">
          <label className="text-xs text-muted">
            Minutes
            <Input
              type="number"
              min={5}
              value={mins}
              onChange={(e) => setMins(Number(e.target.value))}
              className="mt-1"
            />
          </label>
          <label className="text-xs text-muted">
            Kind
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as WaitReward["kind"])}
              className="mt-1 h-12 w-full rounded-full border border-border bg-surface px-3 text-sm text-fg"
            >
              <option value="discount_pct">% off</option>
              <option value="free_item">Free item</option>
              <option value="gift">Credit</option>
            </select>
          </label>
          <label className="text-xs text-muted">
            Value
            <Input
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="mt-1"
            />
          </label>
        </div>
        <Button type="submit" variant="secondary">
          Add to ladder
        </Button>
      </form>

      <ul className="mt-3 flex flex-col gap-1">
        {rewards.map((rw) => (
          <li key={rw.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted">
              {rw.minWaitMins}m · {rw.title}
            </span>
            <button
              type="button"
              className="text-xs text-danger"
              onClick={async () => {
                await deleteReward({ data: rw.id });
                setRewards((cur) => cur.filter((x) => x.id !== rw.id));
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <h2 className="mb-1 mt-8 font-display text-lg font-medium tracking-tight">Advance deposit tiers</h2>
      <p className="mb-3 text-xs text-muted">
        Guests pay now to hold a table. Higher layers skip more of the line and leave a coupon on their bill.
      </p>
      <ul className="flex flex-col gap-2">
        {tiers.map((t) => (
          <li key={t.id} className="rounded-[20px] border border-border bg-surface px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-sm tabular-nums">{t.amount === 0 ? "Free" : formatInr(t.amount)}</p>
            </div>
            <p className="text-xs text-muted">
              {t.discountPct ? `${t.discountPct}% off · ` : ""}
              {t.perk}
            </p>
            {t.amount > 0 && (
              <button
                type="button"
                className="mt-2 text-xs text-danger"
                onClick={async () => {
                  await deleteTier({ data: t.id });
                  setTiers((cur) => cur.filter((x) => x.id !== t.id));
                }}
              >
                Remove tier
              </button>
            )}
          </li>
        ))}
      </ul>

      <form
        className="mt-4 flex flex-col gap-2 rounded-[24px] border border-border bg-surface p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!tierName.trim() || !tierPerk.trim()) return;
          await upsertTier({
            data: {
              restaurantId: venueId,
              name: tierName.trim(),
              amount: Math.max(0, tierAmount),
              discountPct: Math.max(0, Math.min(50, tierDiscount)),
              perk: tierPerk.trim(),
              sortOrder: tiers.length,
            },
          });
          setTierName("");
          setTierPerk("");
          setTiers(await listTiers({ data: venueId }));
          toast.success("Deposit tier published");
        }}
      >
        <p className="text-sm font-medium">Add a deposit layer</p>
        <Input value={tierName} onChange={(e) => setTierName(e.target.value)} placeholder="e.g. Prime" />
        <Input value={tierPerk} onChange={(e) => setTierPerk(e.target.value)} placeholder="Perk guests see — starter + 18% off" />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted">
            Deposit (₹)
            <Input
              type="number"
              min={0}
              value={tierAmount}
              onChange={(e) => setTierAmount(Number(e.target.value))}
              className="mt-1"
            />
          </label>
          <label className="text-xs text-muted">
            Bill discount %
            <Input
              type="number"
              min={0}
              max={50}
              value={tierDiscount}
              onChange={(e) => setTierDiscount(Number(e.target.value))}
              className="mt-1"
            />
          </label>
        </div>
        <Button type="submit" variant="secondary">
          Publish tier
        </Button>
      </form>
    </main>
  );
}
