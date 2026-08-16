import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { GuestNav } from "@/components/guest-nav";
import { myActiveQueue } from "@/lib/data/server";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/app")({ component: GuestLayout });

function GuestLayout() {
  const { user, isPending } = useCurrentUserState();
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (isPending || !user) {
      setLive(false);
      return;
    }
    let cancelled = false;
    const pull = () => {
      myActiveQueue()
        .then((q) => {
          if (!cancelled) setLive(Boolean(q));
        })
        .catch(() => {
          if (!cancelled) setLive(false);
        });
    };
    pull();
    const t = window.setInterval(pull, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [user, isPending]);

  return (
    <AppFrame>
      <div className="flex min-h-svh flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Outlet />
        </div>
        <GuestNav liveActive={live} />
      </div>
    </AppFrame>
  );
}
