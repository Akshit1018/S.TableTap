import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CalendarCheck, Gift, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/logo";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { isPending } = useCurrentUserState();

  return (
    <div className="flex min-h-svh justify-center bg-night text-night-fg">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col md:max-w-[430px]">
        <header className="flex items-center justify-between px-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <Wordmark light className="text-[1.85rem]" />
          <SignedIn>
            <Link to="/app" className="text-sm text-night-muted underline-offset-4 hover:underline">
              Open app
            </Link>
          </SignedIn>
        </header>

        <section className="flex flex-1 flex-col px-6 pb-6 pt-6">
          <p className="text-[15px] leading-relaxed text-night-muted">
            Let customers join a restaurant’s waiting list remotely, receive live
            queue updates, and get notified when their table is ready.
          </p>

          <PhoneHero />

          <div className="mt-6 flex flex-col gap-2.5">
            {isPending ? (
              <div className="h-12 animate-pulse rounded-full bg-night-surface" />
            ) : (
              <>
                <SignedOut>
                  <Button asChild size="lg" className="w-full">
                    <Link to="/signup">Sign up</Link>
                  </Button>
                  <Button asChild size="lg" variant="night" className="w-full border border-night-border">
                    <Link to="/login">I already have an account</Link>
                  </Button>
                  <div className="flex items-center justify-center gap-4">
                    <Link to="/app" className="py-2 text-sm text-night-muted underline-offset-4 hover:underline">
                      Skip for now
                    </Link>
                    <span className="text-night-border">·</span>
                    <Link
                      to="/signup"
                      search={{ role: "host" }}
                      className="py-2 text-sm text-night-muted underline-offset-4 hover:underline"
                    >
                      I run a restaurant
                    </Link>
                  </div>
                </SignedOut>
                <SignedIn>
                  <Button asChild size="lg" className="w-full">
                    <Link to="/app">Continue dining</Link>
                  </Button>
                  <Button asChild size="lg" variant="night" className="w-full border border-night-border">
                    <Link to="/host">Open host floor</Link>
                  </Button>
                </SignedIn>
              </>
            )}
          </div>

          <ul className="mt-7 grid gap-2.5">
            <Feature
              icon={Radio}
              title="Remote waitlist"
              copy="Join from anywhere. Watch your place and the live quote move."
            />
            <Feature
              icon={Gift}
              title="Wait-time rewards"
              copy="30 minutes unlocks a plate. Past 60, a real discount lands automatically."
            />
            <Feature
              icon={CalendarCheck}
              title="Pay in advance"
              copy="Flex, Reserve, Prime, Celebrate — each deposit tier a deeper perk."
            />
            <Feature
              icon={Bell}
              title="Table-ready ping"
              copy="Hosts tap Ready. Guests walk in without hovering at the door."
            />
          </ul>
        </section>
      </div>
    </div>
  );
}

function PhoneHero() {
  return (
    <div className="relative mx-auto mt-8 w-[min(100%,280px)]">
      <div className="overflow-hidden rounded-[2.15rem] border-[7px] border-night-border bg-night-surface shadow-[var(--shadow-lift)]">
        <div className="relative h-[18.5rem]">
          <img
            src="/images/hero.jpg"
            alt="Friends dining together"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
          <div className="absolute left-3 top-16 flex flex-col gap-2">
            <Chip>Live queue</Chip>
            <Chip>Wait gifts</Chip>
            <Chip>Advance pay</Chip>
          </div>
          <div className="absolute inset-x-0 bottom-0 px-4 pb-5 pt-16">
            <p className="text-center font-display text-[1.45rem] font-medium leading-tight tracking-tight text-primary-fg">
              Book your table instantly
            </p>
            <p className="mt-1 text-center text-[11px] leading-snug text-primary-fg/75">
              Real-time availability, wait-time gifts, and locked-in deposits.
            </p>
            <div className="mt-3 h-10 rounded-full bg-[linear-gradient(90deg,var(--color-primary-mid),var(--color-primary))] text-center text-sm font-medium leading-10 text-primary-fg">
              Sign up
            </div>
            <p className="mt-1.5 text-center text-[11px] text-primary-fg/60">Skip now</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <span className="inline-flex h-8 items-center rounded-full border border-primary-fg/15 bg-surface/90 px-2.5 text-[11px] font-medium text-fg shadow-[var(--shadow-card)]">
      {children}
    </span>
  );
}

function Feature({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof Radio;
  title: string;
  copy: string;
}) {
  return (
    <li className="flex gap-3 rounded-2xl border border-night-border bg-night-surface px-3.5 py-3">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs leading-snug text-night-muted">{copy}</p>
      </div>
    </li>
  );
}
