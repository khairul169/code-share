import type { FileSchema } from "@/server/db/schema/file";
import { createContext, useContext } from "react";

type TEditorContext = {
  onOpenFile: (fileId: number) => void;
  onFileChanged: (file: Omit<FileSchema, "content">) => void;
  onDeleteFile: (fileId: number) => void;
};

const EditorContext = createContext<TEditorContext | null>(null);

export const useEditorContext = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("Component not in EditorContext!");
  }

  return ctx;
};

export default EditorContext;
