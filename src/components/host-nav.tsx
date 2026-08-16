import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, Gift, LayoutGrid, Rows3 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/host", label: "Floor", icon: Rows3, exact: true },
  { to: "/host/bookings", label: "Booked", icon: CalendarDays, exact: false },
  { to: "/host/perks", label: "Perks", icon: Gift, exact: false },
  { to: "/host/more", label: "More", icon: LayoutGrid, exact: false },
] as const;

export function HostNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky bottom-0 z-20 border-t border-border bg-surface/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur">
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex h-12 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
