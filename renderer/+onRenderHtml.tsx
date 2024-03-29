import ReactDOMServer from "react-dom/server";
import { escapeInject, dangerouslySkipEscape } from "vike/server";
import type { OnRenderHtmlAsync } from "vike/types";
import { getPageMetadata } from "./utils";
import App from "./app";

export const onRenderHtml: OnRenderHtmlAsync = async (
  pageContext
): ReturnType<OnRenderHtmlAsync> => {
  const { Page } = pageContext;

  if (!Page)
    throw new Error(
      "My onRenderHtml() hook expects pageContext.Page to be defined"
    );

  const page = ReactDOMServer.renderToString(
    <App pageContext={pageContext}>
      <Page />
    </App>
  );

  // See https://vike.dev/head
  const metadata = getPageMetadata(pageContext);

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en" class="dark">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${dangerouslySkipEscape(metadata)}
      </head>
      <body>
        <div id="react-root">${dangerouslySkipEscape(page)}</div>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {},
  };
};
