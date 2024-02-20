import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BASE_URL } from "./consts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileExt(filename: string) {
  return filename.substring(filename.lastIndexOf(".") + 1);
}

export function getUrl(...path: string[]) {
  return BASE_URL + ("/" + path.join("/")).replace(/\/\/+/g, "/");
}
