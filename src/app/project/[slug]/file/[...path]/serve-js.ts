import { BASE_URL } from "@/lib/consts";
import { FileSchema } from "@/server/db/schema/file";

export const serveJs = async (file: FileSchema, slug: string) => {
  let content = file.content || "";

  const importRegex = /(?:import.+from.+)(?:"|')(.+)(?:"|')/g;
  content = content.replace(
    importRegex,
    (match: string, importPath: string) => {
      // local file
      if (importPath.startsWith("./")) {
        return match.replace(
          importPath,
          BASE_URL + `/project/${slug}/file` + importPath.substring(1)
        );
      }

      // resolve to esm
      return match.replace(importPath, "https://esm.sh/" + importPath);
    }
  );

  try {
    const res = await fetch("http://localhost:3001/file/" + file.path);
    if (!res.ok) {
      throw new Error(res.statusText);
    }

    const data = await res.text();
    if (typeof data !== "string") {
      throw new Error("Invalid response!");
    }

    return data;
  } catch (err) {
    console.error((err as any).message);
  }

  return content;
};
