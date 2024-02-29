import { getFileExt } from "~/lib/utils";
import trpc from "~/lib/trpc";
import { useData } from "~/renderer/hooks";
import { Data } from "../+data";
import Spinner from "~/components/ui/spinner";
import { previewStore } from "../stores/web-preview";
import { useProjectContext } from "../context/project";
import { Suspense, lazy } from "react";
const CodeEditor = lazy(() => import("~/components/ui/code-editor"));

type Props = {
  id: number;
};

const FileViewer = ({ id }: Props) => {
  const { project } = useProjectContext();
  const { initialFiles } = useData<Data>();
  const initialData = initialFiles.find((i) => i.id === id);

  const { data, isLoading, refetch } = trpc.file.getById.useQuery(id, {
    initialData,
  });

  const onFileContentChange = () => {
    // refresh preview
    previewStore.getState().refresh();
  };

  const updateFileContent = trpc.file.update.useMutation({
    onSuccess: () => {
      onFileContentChange();
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
      <Suspense fallback={<LoadingLayout />}>
        <CodeEditor
          lang={ext}
          value={data?.content || ""}
          formatOnSave
          onChange={(val) =>
            updateFileContent.mutate({
              projectId: project.id,
              id,
              content: val,
            })
          }
        />
      </Suspense>
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
