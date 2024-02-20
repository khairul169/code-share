"use client";

import { getFileExt } from "@/lib/utils";
import React from "react";
import CodeEditor from "../ui/code-editor";
import trpc from "@/lib/trpc";

type Props = {
  id: number;
  onFileChange?: () => void;
};

const FilePreview = ({ id, onFileChange }: Props) => {
  const type = "text";
  const { data, isLoading, refetch } = trpc.file.getById.useQuery(id);
  const updateFileContent = trpc.file.update.useMutation({
    onSuccess: () => {
      if (onFileChange) onFileChange();
      refetch();
    },
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }
  if (!data) {
    return <p>File not found.</p>;
  }

  const { filename } = data;

  if (type === "text") {
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

export default FilePreview;
