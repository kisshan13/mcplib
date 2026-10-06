import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { ExampleCard } from "@/components/example-card";
import { useExampleQuery } from "@/hooks/query/use-example-query";

export const Route = createFileRoute("/")({
  component: HomeRoute
});

function HomeRoute() {
  const exampleQuery = useExampleQuery();

  return (
    <AppShell>
      <h1>Base web template</h1>
      <p>Use this app as the starting point for a new frontend.</p>
      {exampleQuery.isPending && <p>Loading API example…</p>}
      {exampleQuery.isError && <p>API is unavailable. Start @apps/api to test it.</p>}
      {exampleQuery.data && <ExampleCard data={exampleQuery.data} />}
    </AppShell>
  );
}
