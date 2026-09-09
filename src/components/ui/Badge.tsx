import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  color?: string;
} & Omit<ComponentProps<"span">, "children" | "className">;

export function Badge({ children, className, color, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      style={color ? { color } : undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-[2px] border border-border px-1.5 py-px",
        "text-[11px] leading-4 text-accent",
        className,
      )}
    >
      {children}
    </span>
  );
}