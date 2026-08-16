import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-full border border-border bg-surface px-5 text-[15px] text-fg placeholder:text-subtle",
        "outline-none transition-shadow duration-150 focus:ring-2 focus:ring-primary/30",
        className,
      )}
      {...props}
    />
  );
}
