import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-10 place-items-center rounded-2xl bg-primary-soft text-primary",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="11" r="6" />
        <circle cx="12" cy="11" r="1.6" fill="currentColor" stroke="none" />
        <path d="M12 17v4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Wordmark({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <span className={cn("font-display text-2xl font-medium tracking-tight", light ? "text-night-fg" : "text-fg", className)}>
      TableTap
    </span>
  );
}
