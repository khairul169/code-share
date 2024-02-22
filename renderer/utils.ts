import type { PageContext } from "vike/types";

export function getPageMetadata(pageContext: PageContext) {
  let title = pageContext.data?.title || pageContext.config.title;
  title = title ? `${title} - CodeShare` : "Welcome to CodeShare";

  const description =
    pageContext.data?.description ||
    pageContext.config.description ||
    "Share your frontend result with everyone";

  return { title, description };
}
