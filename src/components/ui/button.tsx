import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-pixel tracking-wide transition-[transform,box-shadow,opacity] duration-100 ease-out disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70",
  {
    variants: {
      variant: {
        default:
          "bg-gold text-gold-fg shadow-[var(--shadow-gold)] hover:brightness-105 active:not-disabled:translate-y-[2px] active:not-disabled:shadow-none",
        blue:
          "bg-blue text-blue-fg shadow-[var(--shadow-blue)] hover:brightness-110 active:not-disabled:translate-y-[2px] active:not-disabled:shadow-none",
        accent:
          "bg-gold text-gold-fg shadow-[var(--shadow-gold)] hover:brightness-105 active:not-disabled:translate-y-[2px] active:not-disabled:shadow-none",
        outline:
          "bg-raised text-fg shadow-[var(--shadow-border)] hover:bg-surface active:not-disabled:translate-y-px",
        ghost: "bg-transparent text-fg hover:bg-raised",
        danger: "bg-danger text-fg hover:opacity-90",
      },
      size: {
        default: "h-11 rounded-md px-5 text-sm",
        sm: "h-9 rounded-md px-3.5 text-xs",
        lg: "h-12 rounded-md px-7 text-base",
        icon: "size-11 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
