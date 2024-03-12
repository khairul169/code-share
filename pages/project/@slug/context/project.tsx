import { createContext, useContext } from "react";
import type { ProjectSchema } from "~/server/db/schema/project";

type TProjectContext = {
  project: ProjectSchema & { isMutable: boolean };
  isCompact?: boolean;
  isEmbed?: boolean;
};

const ProjectContext = createContext<TProjectContext | null>(null);

export const useProjectContext = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error("Component not in ProjectContext!");
  }

  return ctx;
};

export default ProjectContext;
