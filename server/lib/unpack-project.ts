import fs from "node:fs/promises";
import path from "node:path";
import { and, eq, isNull } from "drizzle-orm";
import db from "../db";
import { file } from "../db/schema/file";
import { fileExists, getProjectDir } from "./utils";
import { getFileExt } from "~/lib/utils";
import { ProjectSchema } from "../db/schema/project";

type UnpackProjectOptions = {
  ext: string;
};

export const unpackProject = async (
  projectData: ProjectSchema,
  opt: Partial<UnpackProjectOptions> = {}
) => {
  const files = await db.query.file.findMany({
    where: and(
      eq(file.projectId, projectData.id),
      eq(file.isDirectory, false),
      eq(file.isFile, false),
      isNull(file.deletedAt)
    ),
  });

  const projectDir = getProjectDir(projectData);
  if (!fileExists(projectDir)) {
    await fs.mkdir(projectDir, { recursive: true });
  }

  for (const file of files) {
    const ext = getFileExt(file.filename);

    // skip file if not in included extension list
    if (opt.ext && opt.ext.length > 0 && !opt.ext.split(",").includes(ext)) {
      continue;
    }

    const fpath = path.resolve(
      projectDir,
      file.path.replace(/(\.{2})(\/+)/g, "")
    );
    const dir = path.dirname(fpath);
    if (!fileExists(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }

    await fs.writeFile(fpath, file.content || "");
  }

  return projectDir;
};
