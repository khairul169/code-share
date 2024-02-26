import postcssPlugin from "postcss";
import tailwindcss from "tailwindcss";
import cssnano from "cssnano";
import { FileSchema } from "~/server/db/schema/file";
import { unpackProject } from "~/server/lib/unpack-project";
import { ProjectSchema } from "~/server/db/schema/project";

export const postcss = async (project: ProjectSchema, fileData: FileSchema) => {
  const content = fileData.content || "";
  const cfg = project.settings?.css;

  try {
    const projectDir = await unpackProject(project, {
      ext: "ts,tsx,js,jsx,html",
    });
    const plugins: any[] = [];

    if (cfg?.tailwindcss) {
      plugins.push(
        tailwindcss({ content: [projectDir + "/**/*.{ts,tsx,js,jsx,html}"] })
      );
    }

    const result = await postcssPlugin([
      ...plugins,
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
