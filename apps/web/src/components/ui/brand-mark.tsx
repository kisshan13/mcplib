import { Blobatar } from "@blobatar/react";
import "blobatar/motion.css";

export interface BrandMarkProps {
  size?: number;
  label?: string;
  className?: string;
}

const brandPalette = {
  bg: "#1c1917",
  head: "#facc15",
  eye: "#18181b"
};

export function BrandMark({ size = 48, label = "MCPLib mascot", className = "" }: BrandMarkProps) {
  return (
    <div
      className={`grid place-items-center rounded-[42%_58%_55%_45%_/_48%_44%_56%_52%] bg-slate-900 contrast-125 transition-transform duration-200 hover:-translate-y-0.5 hover:-rotate-2 ${className}`.trim()}
      role="img"
      aria-label={label}
    >
      <Blobatar
        name="mcplib"
        size={size}
        traits={{ shape: 0.825 }}
        animate="always"
        background="squircle"
        palette={brandPalette}
      />
    </div>
  );
}
