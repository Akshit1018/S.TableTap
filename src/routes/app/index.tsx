import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { RestaurantCard } from "@/components/restaurant-card";
import { listRestaurants } from "@/lib/data/server";
import type { Restaurant } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/app/")({ component: Discover });

const filters = ["All", "Short wait", "Long wait rewards", "Rooftop", "Date night"] as const;

function Discover() {
  const user = useCurrentUser();
  const [rows, setRows] = useState<Restaurant[] | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      listRestaurants()
        .then((data) => {
          if (!cancelled) setRows(data);
        })
        .catch(() => {
          if (!cancelled) setRows([]);
        });
    };
    load();
    const t = window.setInterval(load, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  const visible = useMemo(() => {
    if (!rows) return [];
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      const text = `${r.name} ${r.cuisine} ${r.neighborhood} ${r.tags.join(" ")}`.toLowerCase();
      if (needle && !text.includes(needle)) return false;
      if (filter === "Short wait") return r.waitMins <= 25;
      if (filter === "Long wait rewards") return r.waitMins >= 40;
      if (filter === "Rooftop") return r.tags.includes("Rooftop") || r.cuisine.includes("Rooftop");
      if (filter === "Date night") return r.tags.includes("Date night") || r.tags.includes("Sunset");
      return true;
    });
  }, [rows, q, filter]);

  const featured = visible[0];
  const rest = visible.slice(1);

  return (
    <main className="flex flex-1 flex-col pb-2">
      <header className="px-5 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <div>
            <p className="inline-flex items-center gap-1 text-xs font-medium text-primary">
              <MapPin className="size-3.5" />
              Jaipur
            </p>
            <h1 className="font-display text-[1.7rem] font-medium tracking-tight">
              {user?.displayName ? `Evening, ${user.displayName.split(" ")[0]}` : "Find a table"}
            </h1>
          </div>
          <Link
            to="/host"
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted"
          >
            Host view
          </Link>
        </div>
        <label className="mt-4 flex h-12 items-center gap-2 rounded-full border border-border bg-surface px-4">
          <Search className="size-4 text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Restaurant, cuisine, neighbourhood"
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-subtle"
          />
        </label>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "h-9 shrink-0 rounded-full px-3.5 text-xs font-medium",
                filter === f ? "bg-ink text-primary-fg" : "bg-surface-2 text-muted",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-4 px-5">
        {!rows ? (
          <>
            <div className="h-64 animate-pulse rounded-[28px] bg-surface-2" />
            <div className="h-52 animate-pulse rounded-[28px] bg-surface-2" />
          </>
        ) : visible.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">No rooms match that search.</p>
        ) : (
          <>
            {featured && <RestaurantCard restaurant={featured} featured />}
            {rest.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </>
        )}
      </div>
    </main>
  );
}
