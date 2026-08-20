import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md bg-raised px-3.5 text-sm text-fg placeholder:text-faint shadow-[var(--shadow-border)] outline-none transition-[box-shadow] duration-150 focus:shadow-[0_0_0_1px_var(--color-gold)]",
        className,
      )}
      {...props}
    />
  );
}
