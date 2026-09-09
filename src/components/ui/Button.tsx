import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-black hover:bg-[#33dfff] border border-accent",
  secondary:
    "bg-transparent text-fg border border-border hover:border-border-strong hover:bg-bg-hover",
  ghost:
    "bg-transparent text-fg-muted border border-transparent hover:text-fg hover:bg-bg-hover",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, keyof CommonProps> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, keyof CommonProps> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "secondary", className, ...rest } = props;
  const classes = cn(
    "inline-flex items-center gap-1 justify-center rounded-[2px] px-3 py-1.5",
    "text-[13px] font-medium transition-colors cursor-pointer select-none",
    "disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    className,
  );

  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link {...(rest as ButtonAsLink)} className={classes} />
    );
  }
  return <button {...(rest as ButtonAsButton)} className={classes} />;
}