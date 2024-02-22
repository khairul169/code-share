import { FileSchema } from "~/server/db/schema/file";
import { transformJs } from "~/server/lib/transform-js";

export const serveJs = async (file: FileSchema) => {
  let content = file.content || "";

  // transform js
  content = await transformJs(content);

  return content;
};
