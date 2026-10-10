import type { AnchorHTMLAttributes } from "react";

export function TextLink({ className = "", ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={`inline-flex items-center gap-2 font-mono text-xs text-zinc-400 no-underline transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${className}`.trim()}
      {...props}
    />
  );
}
