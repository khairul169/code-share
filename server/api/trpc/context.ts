import { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions) => {
  return {};
};

export type Context = Awaited<ReturnType<typeof createContext>>;
