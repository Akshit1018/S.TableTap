import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn, SignedIn, SignedOut } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { claimGift, getMyProfile, myGifts, updateProfile } from "@/lib/data/server";
import type { Gift, Profile } from "@/lib/data/types";
import { cn, formatInr, initials } from "@/lib/utils";

export const Route = createFileRoute("/app/you")({ component: YouPage });

function YouPage() {
  const { user, isPending } = useCurrentUserState();
  const [gifts, setGifts] = useState<Gift[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (isPending || !user) return;
    Promise.all([myGifts(), getMyProfile()])
      .then(([g, p]) => {
        setGifts(g);
        setProfile(p);
      })
      .catch(() => {
        setGifts([]);
      });
  }, [user, isPending]);

  if (isPending) {
    return <main className="flex flex-1 flex-col p-6"><div className="h-24 animate-pulse rounded-full bg-surface-2" /></main>;
  }

  return (
    <main className="flex flex-1 flex-col px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <h1 className="font-display text-2xl font-medium tracking-tight">You</h1>

      <SignedOut>
        <div className="mt-8 rounded-[28px] border border-border bg-surface p-6 text-center">
          <p className="text-sm text-muted">Sign in to keep wait rewards, deposits, and gifts on this phone.</p>
          <Button asChild className="mt-5">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </SignedOut>

      <SignedIn>
        {!user ? (
          <RedirectToSignIn />
        ) : (
          <>
            <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-border bg-surface p-4">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="size-14 rounded-full object-cover" />
              ) : (
                <span className="grid size-14 place-items-center rounded-full bg-primary-soft font-medium text-primary">
                  {initials(user.displayName ?? user.primaryEmail ?? "G")}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">{user.displayName ?? "Guest"}</p>
                <p className="truncate text-xs text-muted">{user.primaryEmail}</p>
              </div>
            </div>

            <Link
              to="/host"
              className="mt-3 flex items-center justify-between rounded-[24px] border border-border bg-surface px-4 py-4"
            >
              <div>
                <p className="text-sm font-medium">Restaurant floor</p>
                <p className="text-xs text-muted">Seat parties, send gifts, tune the wait ladder.</p>
              </div>
              <ChevronRight className="size-4 text-muted" />
            </Link>

            <h2 className="mb-2 mt-8 font-display text-lg font-medium tracking-tight">Rewards & gifts</h2>
            {!gifts ? (
              <div className="h-28 animate-pulse rounded-[24px] bg-surface-2" />
            ) : gifts.length === 0 ? (
              <p className="rounded-[24px] border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
                Wait long enough — or pre-book — and the house will put something here.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {gifts.map((g) => (
                  <li
                    key={g.id}
                    className={cn(
                      "rounded-[22px] border border-border bg-surface px-4 py-3",
                      g.claimed && "opacity-60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{g.title}</p>
                        <p className="text-xs text-muted">
                          {g.restaurantName}
                          {g.value && g.kind === "discount_pct" ? ` · ${g.value}%` : ""}
                          {g.value && g.kind === "gift" ? ` · ${formatInr(g.value)}` : ""}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-wider text-subtle">
                          {g.source === "wait" ? "Wait reward" : g.source === "host" ? "From the house" : "Advance book"}
                        </p>
                      </div>
                      {!g.claimed ? (
                        <Button
                          size="sm"
                          variant="soft"
                          onClick={async () => {
                            await claimGift({ data: g.id });
                            setGifts((cur) => cur?.map((x) => (x.id === g.id ? { ...x, claimed: true } : x)) ?? null);
                            toast.success("Show this at the table");
                          }}
                        >
                          Use
                        </Button>
                      ) : (
                        <span className="text-xs text-muted">Used</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  const next = profile?.rolePref === "host" ? "guest" : "host";
                  const p = await updateProfile({ data: { rolePref: next } });
                  setProfile(p);
                  toast.message(next === "host" ? "Host tools stay in the floor tab" : "Back to dining");
                }}
              >
                {profile?.rolePref === "host" ? "Prefer dining mode" : "I run a restaurant"}
              </Button>
              <Button variant="ghost" onClick={() => void signOut("/")}>
                Sign out
              </Button>
            </div>
          </>
        )}
      </SignedIn>
    </main>
  );
}
