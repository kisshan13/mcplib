import { useState } from "react";
import { resolveMcpImage } from "./mcp-image-map";

export function McpImage({ mcpId }: { mcpId: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSource = resolveMcpImage(mcpId);

  if (!imageSource || imageFailed) {
    return (
      <span
        className="grid size-9 shrink-0 place-items-center rounded-lg bg-zinc-900 text-zinc-500"
        aria-hidden="true"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 8.5h14M5 15.5h14M8.5 5v14M15.5 5v14"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </span>
    );
  }

  return (
    <img
      className="size-9 shrink-0 rounded-lg object-cover"
      src={imageSource}
      alt=""
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
  );
}
