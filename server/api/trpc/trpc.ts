import { createContext } from "./context";
import { appRouter } from "../../routers/_app";
import { createCallerFactory } from ".";

const trpcServer = createCallerFactory(appRouter)(createContext);

export default trpcServer;
