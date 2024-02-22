import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BASE_URL } from "./consts";
import type { ProjectSchema } from "~/server/db/schema/project";
import type { FileSchema } from "~/server/db/schema/file";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileExt(filename: string) {
  return filename.substring(filename.lastIndexOf(".") + 1);
}

export function getUrl(...path: string[]) {
  return BASE_URL + ("/" + path.join("/")).replace(/\/\/+/g, "/");
}

export function getPreviewUrl(
  project: Pick<ProjectSchema, "slug">,
  file: string | Pick<FileSchema, "path">
) {
  return getUrl(
    `api/preview/${project.slug}`,
    typeof file === "string" ? file : file.path
  );
}
