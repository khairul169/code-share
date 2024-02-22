import { createContext } from "./context";
import { appRouter } from "../../routers/_app";
import { createCallerFactory } from ".";
import { PageContext } from "vike/types";

const trpcServer = async (ctx: PageContext) => {
  const createCaller = createCallerFactory(appRouter);
  const context = await createContext({ req: ctx.req });
  return createCaller(context);
};

export default trpcServer;
