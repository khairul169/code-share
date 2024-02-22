"use client";

import { getFileExt } from "~/lib/utils";
import React from "react";
import CodeEditor from "../../../../components/ui/code-editor";
import trpc from "~/lib/trpc";
import { useData } from "~/renderer/hooks";
import { Data } from "../+data";
import ClientOnly from "~/renderer/client-only";
import Spinner from "~/components/ui/spinner";

type Props = {
  id: number;
  onFileContentChange?: () => void;
};

const FileViewer = ({ id, onFileContentChange }: Props) => {
  const { pinnedFiles } = useData<Data>();
  const initialData = pinnedFiles.find((i) => i.id === id);

  const { data, isLoading, refetch } = trpc.file.getById.useQuery(id, {
    initialData,
  });
  const updateFileContent = trpc.file.update.useMutation({
    onSuccess: () => {
      if (onFileContentChange) onFileContentChange();
      refetch();
    },
  });

  if (isLoading) {
    return <LoadingLayout />;
  }

  if (!data || data.isDirectory) {
    return <p>File not found.</p>;
  }

  const { filename } = data;

  if (!data.isFile) {
    const ext = getFileExt(filename);

    return (
      <ClientOnly fallback={<SSRCodeEditor value={data?.content} />}>
        <CodeEditor
          lang={ext}
          value={data?.content || ""}
          formatOnSave
          onChange={(val) => updateFileContent.mutate({ id, content: val })}
        />
      </ClientOnly>
    );
  }

  return null;
};

const LoadingLayout = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner />
    </div>
  );
};

const SSRCodeEditor = ({ value }: { value?: string | null }) => {
  return (
    <textarea
      className="w-full h-full py-3 pl-11 pr-2 overflow-x-auto text-nowrap font-mono text-sm md:text-[16px] md:leading-[22px] bg-[#1a1b26] text-[#787c99]"
      value={value || ""}
      readOnly
    />
  );
};

export default FileViewer;
