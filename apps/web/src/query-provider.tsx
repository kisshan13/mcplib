/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
  useMutation,
  UseMutationOptions
} from "@tanstack/react-query";
import React from "react";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (data, variables, context, mutation) => {
      mutation.options.mutationKey?.forEach((key) => {
        queryClient.invalidateQueries({
          queryKey: [key]
        });
      });
    }
  })
});

export type OmittedMutationFunction<T> = Omit<UseMutationOptions<unknown, any, T>, "mutationFn">;

export function useWrappedMutation<T>(options: OmittedMutationFunction<T>, fn: (data: T) => any) {
  return useMutation<unknown, any, T>({
    ...options,
    mutationFn: (data: T) => {
      return fn(data);
    }
  });
}

export function QueryProvider({ children }: { children?: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
