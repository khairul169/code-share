"use client";

import { getFileExt } from "~/lib/utils";
import CodeEditor from "../../../../components/ui/code-editor";
import trpc from "~/lib/trpc";
import { useData } from "~/renderer/hooks";
import { Data } from "../+data";
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

const LoadingLayout = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner />
    </div>
  );
};

export default FileViewer;
