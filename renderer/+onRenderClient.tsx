import ReactDOM from "react-dom/client";
import { getPageMetadata } from "./utils";
import type { OnRenderClientAsync } from "vike/types";
import Layout from "./layout";

let root: ReactDOM.Root;

export const onRenderClient: OnRenderClientAsync = async (
  pageContext
): ReturnType<OnRenderClientAsync> => {
  const { Page } = pageContext;

  if (!Page)
    throw new Error(
      "My onRenderClient() hook expects pageContext.Page to be defined"
    );

  const container = document.getElementById("react-root");
  if (!container) throw new Error("DOM element #react-root not found");

  const page = (
    <Layout pageContext={pageContext}>
      <Page />
    </Layout>
  );

  if (pageContext.isHydration) {
    root = ReactDOM.hydrateRoot(container, page);
  } else {
    if (!root) {
      root = ReactDOM.createRoot(container);
    }
    root.render(page);
  }

  const meta = getPageMetadata(pageContext);
  document.title = meta.title;
};
