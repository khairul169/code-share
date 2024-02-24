import React, { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import trpc, { getBaseUrl } from "~/lib/trpc";
import { toast } from "~/lib/utils";
import { httpBatchLink } from "@trpc/react-query";
import { Toaster } from "~/components/ui/sonner";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: {
            onError(err) {
              toast.error(err.message);
            },
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
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default Providers;
