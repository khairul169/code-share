import { router } from "../api/trpc";
import file from "./file";

export const appRouter = router({
  file,
});

// export type definition of API
export type AppRouter = typeof appRouter;
