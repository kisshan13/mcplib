import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { UseMutationOptions } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

export type OmittedMutationFunction<T> = Omit<
  UseMutationOptions<unknown, Error, T>,
  "mutationFn"
>;

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000
          }
        }
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
