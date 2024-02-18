import { createContext } from "./context";
import { appRouter } from "./routers/_app";
import { createCallerFactory } from "./trpc";

export const trpcServer = createCallerFactory(appRouter)(createContext);
