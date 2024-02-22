import postcssPlugin from "postcss";
import tailwindcss from "tailwindcss";
import cssnano from "cssnano";
import { FileSchema } from "~/server/db/schema/file";
import { unpackProject } from "~/server/lib/unpack-project";

export const postcss = async (fileData: FileSchema) => {
  const content = fileData.content || "";

  try {
    const projectDir = await unpackProject({ ext: "ts,tsx,js,jsx,html" });

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
    console.error("postcss error", err);
    return content;
  }
};
