import { Check, Gift, Percent, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WaitReward } from "@/lib/data/types";

const icons = {
  discount_pct: Percent,
  free_item: UtensilsCrossed,
  gift: Gift,
};

export function RewardLadder({
  rewards,
  elapsedMins = 0,
  compact = false,
}: {
  rewards: WaitReward[];
  elapsedMins?: number;
  compact?: boolean;
}) {
  if (rewards.length === 0) return null;
  return (
    <ol className="flex flex-col gap-2">
      {rewards.map((rw, i) => {
        const unlocked = elapsedMins >= rw.minWaitMins;
        const Icon = icons[rw.kind];
        return (
          <li
            key={rw.id}
            className={cn(
              "flex items-start gap-3 rounded-2xl border px-3.5 py-3 transition-colors duration-200",
              unlocked
                ? "border-primary/25 bg-primary-soft"
                : "border-border bg-surface",
              compact && "py-2.5",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                unlocked ? "bg-primary text-primary-fg" : "bg-surface-2 text-muted",
              )}
            >
              {unlocked ? <Check className="size-4" strokeWidth={2.4} /> : <Icon className="size-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className={cn("text-sm font-medium", unlocked ? "text-primary" : "text-fg")}>
                  {rw.title}
                </p>
                <span className="shrink-0 font-sans text-xs tabular-nums text-muted">
                  {rw.minWaitMins} min
                </span>
              </div>
              {!compact && (
                <p className="mt-0.5 text-xs leading-snug text-muted">{rw.description}</p>
              )}
            </div>
            {i < rewards.length - 1 ? null : null}
          </li>
        );
      })}
    </ol>
  );
}
