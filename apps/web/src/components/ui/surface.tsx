import type { HTMLAttributes } from "react";

export type SurfaceTone = "dark" | "muted" | "light";

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "article" | "aside" | "section";
  padding?: "default" | "compact";
  tone?: SurfaceTone;
}

const toneClasses: Record<SurfaceTone, string> = {
  dark: "bg-zinc-900 text-zinc-100",
  muted: "bg-zinc-800 text-zinc-100",
  light: "bg-white text-zinc-950"
};

export function Surface({
  as: Element = "div",
  padding = "default",
  tone = "dark",
  className = "",
  ...props
}: SurfaceProps) {
  const paddingClass = padding === "compact" ? "p-4" : "p-6";

  return (
    <Element
      className={`rounded-xl ${paddingClass} ${toneClasses[tone]} ${className}`.trim()}
      {...props}
    />
  );
}
