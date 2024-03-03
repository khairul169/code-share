import { PageContext } from "vike/types";
import { render } from "vike/abort";
import trpcServer from "~/server/api/trpc/trpc";
import { BASE_URL } from "~/lib/consts";

export const data = async (ctx: PageContext) => {
  const trpc = await trpcServer(ctx);
  const searchParams = ctx.urlParsed.search;
  const filesParam = searchParams.files ? searchParams.files.split(",") : null;

  const project = await trpc.project.getById(ctx.routeParams?.slug!);
  if (!project) {
    throw render(404, "Project not found!");
  }

  const files = await trpc.file.getAll({ projectId: project.id! });
  const initialFiles = files.filter((i) =>
    filesParam != null ? filesParam.includes(i.path) : i.isPinned
  );

  return {
    title: project.title,
    description: `Check ${project.title} on CodeShare!`,
    ogImage: project.thumbnail
      ? BASE_URL + "/api/thumbnail" + project.thumbnail
      : undefined,
    project,
    files,
    initialFiles,
  };
};

export type Data = Awaited<ReturnType<typeof data>>;
