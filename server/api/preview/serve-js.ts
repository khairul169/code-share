import { getFileExt } from "~/lib/utils";
import { FileSchema } from "~/server/db/schema/file";
import { ProjectSettingsSchema } from "~/server/db/schema/project";
import { transformJs } from "~/server/lib/transform-js";

export const serveJs = async (
  file: FileSchema,
  cfg?: ProjectSettingsSchema["js"]
) => {
  let content = file.content || "";

  // transpile to es5
  if (cfg?.transpiler === "swc") {
    const ext = getFileExt(file.filename);
    const typescript = ["ts", "tsx"].includes(ext);
    content = await transformJs(content, typescript ? "ts" : "js");
  }

  return content;
};
