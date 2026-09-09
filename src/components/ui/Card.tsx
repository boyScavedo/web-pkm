import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type CardProps = ComponentProps<"div">;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "bg-bg-elevated border border-border rounded-[2px]",
        className,
      )}
    />
  );
}