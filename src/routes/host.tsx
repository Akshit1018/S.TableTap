import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppFrame } from "@/components/app-frame";
import { HostNav } from "@/components/host-nav";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listRestaurants } from "@/lib/data/server";
import type { Restaurant } from "@/lib/data/types";
import { HostVenueContext } from "@/components/host-venue";

export const Route = createFileRoute("/host")({ component: HostLayout });

function HostLayout() {
  const { user, isPending } = useCurrentUserState();
  const [venues, setVenues] = useState<Restaurant[]>([]);
  const [venueId, setVenueId] = useState("amber");

  useEffect(() => {
    listRestaurants()
      .then((rows) => {
        setVenues(rows);
        setVenueId((cur) => (rows.some((r) => r.id === cur) ? cur : rows[0]?.id ?? "amber"));
      })
      .catch(() => setVenues([]));
  }, []);

  if (isPending) {
    return (
      <AppFrame>
        <div className="flex flex-1 items-center justify-center p-10">
          <div className="h-10 w-40 animate-pulse rounded-full bg-surface-2" />
        </div>
      </AppFrame>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const venue = venues.find((v) => v.id === venueId) ?? venues[0] ?? null;

  return (
    <HostVenueContext.Provider value={{ venues, venue, venueId, setVenueId }}>
      <AppFrame>
        <div className="flex min-h-svh flex-col">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <Outlet />
          </div>
          <HostNav />
        </div>
      </AppFrame>
    </HostVenueContext.Provider>
  );
}
