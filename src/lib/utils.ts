import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileExt(filename: string) {
  return filename.substring(filename.lastIndexOf(".") + 1);
}
