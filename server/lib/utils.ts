import fs from "node:fs";
import path from "node:path";
import cuid2 from "@paralleldrive/cuid2";
import { ProjectSchema } from "../db/schema/project";

export const fileExists = (path: string) => {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
};

export const getProjectDir = (project: ProjectSchema) => {
  return path.resolve(process.cwd(), "storage/tmp", project.slug);
};

export const uid = cuid2.init({
  length: 8,
});
