import postcssPlugin from "postcss";
import tailwindcss from "tailwindcss";
import cssnano from "cssnano";
import { fileExists, getProjectDir } from "~/server/lib/utils";
import { FileSchema } from "~/server/db/schema/file";
import { unpackProject } from "~/server/lib/unpack-project";

export const postcss = async (fileData: FileSchema) => {
  const content = fileData.content || "";

  const projectDir = getProjectDir();
  if (!fileExists(projectDir)) {
    return content;
  }

  try {
    await unpackProject({ ext: "ts,tsx,js,jsx,html" });

    const result = await postcssPlugin([
      tailwindcss({
        content: [projectDir + "/**/*.{ts,tsx,js,jsx,html}"],
      }),
      cssnano({
        preset: ["default", { discardComments: { removeAll: true } }],
      }),
    ]).process(content, {
      from: undefined,
    });

    return result.css;
  } catch (err) {
    return content;
  }
};
