import { PageContext } from "vike/types";
import trpcServer from "~/server/api/trpc/trpc";

export const data = async (ctx: PageContext) => {
  const trpc = await trpcServer(ctx);
  const presets = await trpc.project.getTemplates();

  return { presets };
};

export type Data = Awaited<ReturnType<typeof data>>;
