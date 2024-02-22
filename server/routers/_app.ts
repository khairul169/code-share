import { router } from "../api/trpc";
import project from "./project";
import file from "./file";

export const appRouter = router({
  project,
  file,
});

// export type definition of API
export type AppRouter = typeof appRouter;
