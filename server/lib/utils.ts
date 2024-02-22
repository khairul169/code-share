import fs from "node:fs";
import path from "node:path";
import cuid2 from "@paralleldrive/cuid2";

export const fileExists = (path: string) => {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
};

export const getProjectDir = () => {
  return path.resolve(process.cwd(), "storage/tmp/project1");
};

export const uid = cuid2.init({
  length: 8,
});
