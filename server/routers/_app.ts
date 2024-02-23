import { router } from "../api/trpc";
import auth from "./auth";
import project from "./project";
import file from "./file";

export const appRouter = router({
  auth,
  project,
  file,
});

// export type definition of API
export type AppRouter = typeof appRouter;
