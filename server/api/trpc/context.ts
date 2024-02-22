import { Request } from "express";

export const createContext = async ({ req }: { req: Request }) => {
  return {};
};

export type Context = Awaited<ReturnType<typeof createContext>>;
