import type { AnchorHTMLAttributes } from "react";

export interface ActionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "primary" | "secondary";
  compact?: boolean;
}

export function ActionLink({
  variant = "secondary",
  compact = false,
  className = "",
  ...props
}: ActionLinkProps) {
  const variantClasses =
    variant === "primary"
      ? "bg-white !text-zinc-950 hover:bg-zinc-300 hover:!text-zinc-950"
      : "text-white hover:text-zinc-300";
  const sizeClasses = compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-xs";

  return (
    <a
      className={`inline-flex items-center justify-center gap-2 font-mono font-medium no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${sizeClasses} ${variantClasses} ${className}`.trim()}
      {...props}
    />
  );
}
