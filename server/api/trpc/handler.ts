import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "~/server/routers/_app";
import { createContext } from "./context";

const trpc = createExpressMiddleware({
  router: appRouter,
  createContext,
});

export default trpc;
