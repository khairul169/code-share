"use client";

import React, { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import trpc, { getBaseUrl } from "@/lib/trpc";
import { httpBatchLink } from "@trpc/react-query";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getBaseUrl() + "/api/trpc",
          headers() {
            return {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default Providers;
