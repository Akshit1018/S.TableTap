import { Link, createFileRoute } from "@tanstack/react-router";
import { Clock, Gift, Radio, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHostVenue } from "@/components/host-venue";
import { signOut } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/host/more")({ component: HostMore });

function HostMore() {
  const user = useCurrentUser();
  const { venue } = useHostVenue();

  return (
    <main className="flex flex-1 flex-col px-5 pb-6 pt-[max(1.1rem,env(safe-area-inset-top))]">
      <p className="text-xs font-medium uppercase tracking-wider text-subtle">Host tools</p>
      <h1 className="font-display text-2xl font-medium tracking-tight">{venue?.name ?? "House"}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {venue?.description}
      </p>
      <p className="mt-1 text-xs text-subtle">{venue?.hours} · {venue?.address}</p>

      <ul className="mt-8 flex flex-col gap-2">
        <Tip icon={Radio} title="Run the floor" copy="Mark Ready when the table is set. Guests get a live ping." />
        <Tip icon={Clock} title="Pay for time" copy="If the quote slips past 30 or 60 minutes, the ladder pays them automatically." />
        <Tip icon={Gift} title="Send a gift" copy="A dessert or bar credit turns a long wait into a story they repeat." />
        <Tip icon={Users} title="Advance books" copy="Deposits land as confirmed covers. Seat them from the Booked tab." />
      </ul>

      <div className="mt-auto flex flex-col gap-2 pt-10">
        <Button asChild variant="secondary">
          <Link to="/app">Switch to guest</Link>
        </Button>
        {user && (
          <Button variant="ghost" onClick={() => void signOut("/")}>
            Sign out
          </Button>
        )}
      </div>
    </main>
  );
}

function Tip({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof Radio;
  title: string;
  copy: string;
}) {
  return (
    <li className="flex gap-3 rounded-[22px] border border-border bg-surface px-3.5 py-3">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs leading-snug text-muted">{copy}</p>
      </div>
    </li>
  );
}
