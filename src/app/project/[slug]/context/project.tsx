import { createContext, useContext } from "react";

type TProjectContext = {
  isCompact?: boolean;
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
