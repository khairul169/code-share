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
    content = await transformJs(content);
  }

  return content;
};
