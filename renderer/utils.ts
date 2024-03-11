import type { PageContext } from "vike/types";
import { BASE_URL } from "~/lib/consts";

export function getPageTitle(pageContext: PageContext) {
  let title = pageContext.data?.title || pageContext.config.title;
  title = title ? `${title} - CodeShare` : "Welcome to CodeShare";

  return title;
}

export function getPageMetadata(pageContext: PageContext) {
  const canonicalUrl = BASE_URL + pageContext.req.originalUrl;
  const title = getPageTitle(pageContext);
  const description =
    pageContext.data?.description ||
    pageContext.config.description ||
    "Share your frontend result with everyone";
  const ogImage = pageContext.data?.ogImage;

  return `
    <meta name="description" content="${description}" />
    <title>${title}</title>

    <link rel="canonical" href="${canonicalUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    ${ogImage ? `<meta property="og:image" content="${ogImage}" />` : ""}

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${canonicalUrl}" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${description}" />
    ${ogImage ? `<meta property="twitter:image" content="${ogImage}" />` : ""}
  `.trim();
}
