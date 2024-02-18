import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

const trpc = createTRPCReact<AppRouter>({});

export default trpc;
