import { initTRPC } from "@trpc/server";
import { Context } from "./context";

const t = initTRPC.context<Context>().create();

// Base router and procedure helpers
export const { router, procedure, createCallerFactory } = t;
