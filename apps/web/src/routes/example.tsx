import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { useExampleQuery } from "@/hooks/query/use-example-query";

export const Route = createFileRoute("/example")({
  component: ExampleRoute
});

function ExampleRoute() {
  const query = useExampleQuery();

  return (
    <AppShell>
      <h1>Example route</h1>
      <pre>{JSON.stringify(query.data ?? null, null, 2)}</pre>
    </AppShell>
  );
}
