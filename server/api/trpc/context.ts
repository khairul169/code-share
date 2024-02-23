import { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export const createContext = async (ctx: CreateExpressContextOptions) => {
  return ctx;
};

export type Context = Awaited<ReturnType<typeof createContext>>;
