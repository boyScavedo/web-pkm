import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type InputProps = Omit<ComponentProps<"input">, "className"> & {
  className?: string;
};

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-black border border-border text-fg text-[13px] px-3 py-1.5",
        "placeholder:text-fg-dim focus:outline-none focus:border-accent",
        "rounded-[2px] transition-colors",
        className,
      )}
    />
  );
}