import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppFrame({
  children,
  night = false,
  className,
}: {
  children: ReactNode;
  night?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-svh justify-center", night ? "bg-night text-night-fg" : "bg-night")}>
      <div
        className={cn(
          "relative mx-auto flex min-h-svh w-full max-w-md flex-col md:max-w-[430px]",
          night ? "bg-night" : "bg-bg text-fg md:shadow-[var(--shadow-lift)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
