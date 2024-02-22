import { PageContext } from "vike/types";

export const data = async (ctx: PageContext) => {
  const id = ctx.routeParams?.id;
  const post = await fetch(
    "https://jsonplaceholder.typicode.com/posts/" + id
  ).then((response) => response.json());

  return { post, title: post?.title };
};

export type Data = Awaited<ReturnType<typeof data>>;
