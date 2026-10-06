import type { ExampleResponse } from "@/core-api/types";

export function ExampleCard({ data }: { data: ExampleResponse }) {
  return (
    <article className="example-card">
      <p>{data.message}</p>
      <small>Response for: {data.name}</small>
    </article>
  );
}
