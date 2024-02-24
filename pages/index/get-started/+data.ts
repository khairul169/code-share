import { and, eq, isNull } from "drizzle-orm";
import { PageContext } from "vike/types";
import trpcServer from "~/server/api/trpc/trpc";
import db from "~/server/db";
import { ProjectSchema, project } from "~/server/db/schema/project";
import { UserSchema } from "~/server/db/schema/user";

export const data = async (ctx: PageContext) => {
  const trpc = await trpcServer(ctx);
  let forkFrom:
    | (Pick<ProjectSchema, "id" | "title"> & { user: UserSchema })
    | undefined;

  if (ctx.urlParsed.search["fork"]) {
    forkFrom = await db.query.project.findFirst({
      columns: { id: true, title: true },
      where: and(
        eq(project.slug, ctx.urlParsed.search["fork"]),
        isNull(project.deletedAt)
      ),
      with: { user: { columns: { password: false } } },
    });
  }

  const presets = await trpc.project.getTemplates();

  return { presets, forkFrom };
};

export type Data = Awaited<ReturnType<typeof data>>;
