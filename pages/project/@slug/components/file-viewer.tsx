"use client";

import { getFileExt } from "~/lib/utils";
import React from "react";
import CodeEditor from "../../../../components/ui/code-editor";
import trpc from "~/lib/trpc";

type Props = {
  id: number;
  onFileContentChange?: () => void;
};

const FileViewer = ({ id, onFileContentChange }: Props) => {
  const { data, isLoading, refetch } = trpc.file.getById.useQuery(id);
  const updateFileContent = trpc.file.update.useMutation({
    onSuccess: () => {
      if (onFileContentChange) onFileContentChange();
      refetch();
    },
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (!data || data.isDirectory) {
    return <p>File not found.</p>;
  }

  const { filename } = data;

  if (!data.isFile) {
    const ext = getFileExt(filename);

    return (
      <CodeEditor
        lang={ext}
        value={data?.content || ""}
        formatOnSave
        onChange={(val) => updateFileContent.mutate({ id, content: val })}
      />
    );
  }

  return null;
};

export default FileViewer;
