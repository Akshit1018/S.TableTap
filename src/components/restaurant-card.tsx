import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Users } from "lucide-react";
import { cn, priceMarks } from "@/lib/utils";
import type { Restaurant } from "@/lib/data/types";

export function RestaurantCard({
  restaurant,
  featured = false,
}: {
  restaurant: Restaurant;
  featured?: boolean;
}) {
  return (
    <Link
      to="/app/restaurant/$id"
      params={{ id: restaurant.id }}
      className={cn(
        "block overflow-hidden rounded-[28px] border border-border bg-surface shadow-[var(--shadow-card)]",
        "transition-transform duration-200 active:scale-[0.99]",
      )}
    >
      <div className={cn("relative overflow-hidden", featured ? "h-52" : "h-40")}>
        <img
          src={restaurant.coverImage}
          alt=""
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div>
            <p className="font-display text-xl font-medium tracking-tight text-primary-fg">
              {restaurant.name}
            </p>
            <p className="text-xs text-primary-fg/80">
              {restaurant.cuisine} · {priceMarks(restaurant.priceLevel)}
            </p>
          </div>
          <span className="rounded-full bg-surface/95 px-2.5 py-1 text-xs font-medium tabular-nums text-fg">
            {restaurant.rating.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          {restaurant.neighborhood}
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Users className="size-3.5" />
          {restaurant.waitingCount} waiting
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium text-primary tabular-nums">
          <Clock className="size-3.5" />
          {restaurant.waitMins} min
        </span>
      </div>
    </Link>
  );
}
