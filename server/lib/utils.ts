import fs from "node:fs";
import path from "node:path";

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
