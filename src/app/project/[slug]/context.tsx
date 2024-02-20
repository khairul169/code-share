import type { FileSchema } from "@/server/db/schema/file";
import { createContext, useContext } from "react";

type TProjectViewContext = {
  onOpenFile: (fileId: number) => void;
  onFileChanged: (file: Omit<FileSchema, "content">) => void;
  onDeleteFile: (fileId: number) => void;
};

const ProjectViewContext = createContext<TProjectViewContext | null>(null);

export const useProjectContext = () => {
  const ctx = useContext(ProjectViewContext);
  if (!ctx) {
    throw new Error("Component not in ProjectViewContext!");
  }

  return ctx;
};

export default ProjectViewContext;
