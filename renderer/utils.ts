import type { PageContext } from "vike/types";

export function getPageMetadata(pageContext: PageContext) {
  let title = pageContext.data?.title || pageContext.config.title;
  title = title ? `${title} - Vike` : "Welcome to Vike";

  const description =
    pageContext.data?.description || pageContext.config.description || "";

  return { title, description };
}
