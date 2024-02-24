import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import copyToClipboard from "copy-to-clipboard";
import { toast } from "sonner";
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
  file: string | Pick<FileSchema, "path">,
  opt?: Partial<{ raw: boolean }>
) {
  const url = getUrl(
    `api/preview/${project.slug}`,
    typeof file === "string" ? file : file.path
  );
  return opt?.raw ? url + "?raw=true" : url;
}

export const ucfirst = (str: string) => {
  return str.charAt(0).toUpperCase() + str.substring(1);
};

export const ucwords = (str: string) => {
  return str.split(" ").map(ucfirst).join(" ");
};

export const copy = (text: string) => {
  copyToClipboard(text, {
    onCopy: (data) => {
      toast.success("Copied to clipboard!");
      return data;
    },
  });
};

export { toast };
