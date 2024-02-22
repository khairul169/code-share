import { PageContext } from "vike/types";
import { render } from "vike/abort";
import trpcServer from "~/server/api/trpc/trpc";

export const data = async (ctx: PageContext) => {
  const trpc = await trpcServer(ctx);

  const project = await trpc.project.getById(ctx.routeParams?.slug!);
  if (!project) {
    throw render(404, "Project not found!");
  }

  const files = await trpc.file.getAll({ projectId: project.id });
  const pinnedFiles = files.filter((i) => i.isPinned);

  return {
    title: project.title,
    description: `Check ${project.title} on CodeShare!`,
    project,
    files,
    pinnedFiles,
  };
};

export type Data = Awaited<ReturnType<typeof data>>;
