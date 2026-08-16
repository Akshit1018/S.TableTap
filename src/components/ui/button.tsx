import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
  {
    variants: {
      variant: {
        primary:
          "bg-primary bg-[linear-gradient(90deg,var(--color-primary-mid),var(--color-primary))] text-primary-fg hover:opacity-92",
        secondary: "bg-surface-2 text-fg hover:bg-border",
        outline: "border border-border bg-surface text-fg hover:bg-surface-2",
        ghost: "text-fg hover:bg-surface-2",
        night: "bg-night-surface text-night-fg hover:bg-night-border",
        danger: "bg-danger text-primary-fg hover:opacity-92",
        soft: "bg-primary-soft text-primary hover:bg-primary/15",
      },
      size: {
        sm: "h-9 rounded-full px-3.5 text-sm",
        md: "h-11 rounded-full px-5 text-sm",
        lg: "h-12 rounded-full px-6 text-[15px]",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
