import type { ExampleResponse } from "@/core-api/types/example";
import { Surface } from "./ui";

export function ExampleCard({ data }: { data: ExampleResponse }) {
  return (
    <article className="example-card">
      <Surface>
        <p>{data.message}</p>
        <small>Response for: {data.name}</small>
      </Surface>
    </article>
  );
}
