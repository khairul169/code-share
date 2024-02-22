import { PageContext } from "vike/types";
import trpcServer from "~/server/api/trpc/trpc";

export const data = async (ctx: PageContext) => {
  const trpc = await trpcServer(ctx);

  const projects = await trpc.project.getAll();

  return { projects };
};

export type Data = Awaited<ReturnType<typeof data>>;
