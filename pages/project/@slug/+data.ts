import { PageContext } from "vike/types";
import trpcServer from "~/server/api/trpc/trpc";

export const data = async (ctx: PageContext) => {
  const trpc = await trpcServer(ctx);
  const pinnedFiles = await trpc.file.getAll({ isPinned: true });
  const files = await trpc.file.getAll();

  return { files, pinnedFiles };
};

export type Data = Awaited<ReturnType<typeof data>>;
