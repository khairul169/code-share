import db from "~/server/db";
import { FileSchema, file } from "~/server/db/schema/file";
import { and, eq, isNull } from "drizzle-orm";
import { IS_DEV } from "~/server/lib/consts";

export const serveHtml = async (fileData: FileSchema) => {
  const layout = await db.query.file.findFirst({
    where: and(
      eq(file.projectId, fileData.projectId),
      eq(file.filename, "_layout.html"),
      fileData.parentId
        ? eq(file.parentId, fileData.parentId)
        : isNull(file.parentId),
      isNull(file.deletedAt)
    ),
  });

  let content = fileData.content || "";
  if (layout?.content != null) {
    content = layout.content.replace("{CONTENT}", content);
  }

  const bodyOpeningTagIdx = content.indexOf("<body");
  const firstScriptTagIdx = content.indexOf("<script", bodyOpeningTagIdx);
  const injectScripts = ['<script src="/js/hook-console.js"></script>'];

  if (!IS_DEV) {
    // prevent direct access
    injectScripts.push(
      `<script>if (window === window.parent) {window.location.href = '/';}</script>`
    );
  }

  const importMaps = [
    { name: "react", url: "https://esm.sh/react@18.2.0" },
    { name: "react-dom/client", url: "https://esm.sh/react-dom@18.2.0/client" },
  ];

  if (importMaps.length > 0) {
    const imports = importMaps.reduce((a: any, b) => {
      a[b.name] = b.url;
      return a;
    }, {});
    const json = JSON.stringify({ imports });
    injectScripts.unshift(`<script type="importmap">${json}</script>`);
  }

  if (firstScriptTagIdx >= 0 && injectScripts.length > 0) {
    content =
      content.substring(0, firstScriptTagIdx) +
      injectScripts.filter((i) => !!i).join("") +
      content.substring(firstScriptTagIdx);
  }

  return content;
};
