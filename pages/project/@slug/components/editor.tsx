import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import Tabs, { Tab } from "~/components/ui/tabs";
import FileViewer from "./file-viewer";
import trpc from "~/lib/trpc";
import EditorContext from "../context/editor";
import type { FileSchema } from "~/server/db/schema/file";
import Panel from "~/components/ui/panel";
import { previewStore } from "../stores/web-preview";
import { useProjectContext } from "../context/project";
import { ImperativePanelHandle } from "react-resizable-panels";
import Sidebar from "./sidebar";
import useCommandKey from "~/hooks/useCommandKey";
import { Button } from "~/components/ui/button";
import { FaCompress, FaCompressArrowsAlt } from "react-icons/fa";
import ConsoleLogger from "./console-logger";
import { useData } from "~/renderer/hooks";
import { Data } from "../+data";

const Editor = () => {
  const { pinnedFiles } = useData<Data>();
  const trpcUtils = trpc.useUtils();
  const project = useProjectContext();
  const sidebarPanel = useRef<ImperativePanelHandle>(null);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [curTabIdx, setCurTabIdx] = useState(0);
  const [curOpenFiles, setOpenFiles] = useState<number[]>(
    pinnedFiles.map((i) => i.id)
  );

  const openedFilesData = trpc.file.getAll.useQuery(
    { id: curOpenFiles },
    { enabled: curOpenFiles.length > 0, initialData: pinnedFiles }
  );
  const [openedFiles, setOpenedFiles] = useState<any[]>(pinnedFiles);

  const deleteFile = trpc.file.delete.useMutation({
    onSuccess: (file) => {
      trpcUtils.file.getAll.invalidate();
      onFileChanged(file);

      const openFileIdx = curOpenFiles.indexOf(file.id);
      if (openFileIdx >= 0) {
        onCloseFile(openFileIdx);
      }
    },
  });

  const toggleSidebar = useCallback(() => {
    const sidebar = sidebarPanel.current;
    if (!sidebar) {
      return;
    }

    if (sidebar.isExpanded()) {
      sidebar.collapse();
    } else {
      sidebar.expand();
      sidebar.resize(25);
    }
  }, [sidebarPanel]);

  useCommandKey("b", toggleSidebar);

  useEffect(() => {
    if (!pinnedFiles?.length || curOpenFiles.length > 0) {
      return;
    }

    pinnedFiles.forEach((file) => {
      onOpenFile(file.id, false);
    });

    return () => {
      setOpenFiles([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedFiles]);

  useEffect(() => {
    if (openedFilesData.data) {
      setOpenedFiles(openedFilesData.data);
    }
  }, [openedFilesData.data]);

  const onOpenFile = useCallback(
    (fileId: number, autoSwitchTab = true) => {
      const idx = curOpenFiles.indexOf(fileId);
      if (idx >= 0) {
        return setCurTabIdx(idx);
      }

      setOpenFiles((state) => {
        if (autoSwitchTab) {
          setCurTabIdx(state.length);
        }
        return [...state, fileId];
      });
    },
    [curOpenFiles]
  );

  const onDeleteFile = useCallback(
    (fileId: number) => {
      if (
        window.confirm("Are you sure want to delete this files?") &&
        !deleteFile.isPending
      ) {
        deleteFile.mutate(fileId);
      }
    },
    [deleteFile]
  );

  const onCloseFile = useCallback(
    (idx: number) => {
      const _f = [...curOpenFiles];
      _f.splice(idx, 1);
      setOpenFiles(_f);

      if (curTabIdx === idx) {
        setCurTabIdx(Math.max(0, idx - 1));
      }
    },
    [curOpenFiles, curTabIdx]
  );

  const onFileChanged = useCallback(
    (_file: Omit<FileSchema, "content">) => {
      openedFilesData.refetch();
    },
    [openedFilesData]
  );

  const refreshPreview = useCallback(() => {
    previewStore.getState().refresh();
  }, []);

  const openFileList = useMemo(() => {
    return curOpenFiles.map((fileId) => {
      const fileData = openedFiles?.find((i) => i.id === fileId);

      return {
        title: fileData?.filename || "...",
        render: () => (
          <FileViewer id={fileId} onFileContentChange={refreshPreview} />
        ),
      };
    }) satisfies Tab[];
  }, [curOpenFiles, openedFiles, refreshPreview]);

  const PanelComponent = !project.isCompact ? Panel : "div";

  return (
    <EditorContext.Provider
      value={{
        onOpenFile,
        onFileChanged,
        onDeleteFile,
      }}
    >
      <PanelComponent className="h-full relative">
        <ResizablePanelGroup autoSaveId="veditor-panel" direction="horizontal">
          <ResizablePanel
            ref={sidebarPanel}
            panelId={0}
            defaultSize={25}
            minSize={10}
            collapsible
            collapsedSize={0}
            className="bg-[#1e2536]"
            onExpand={() => setSidebarExpanded(true)}
            onCollapse={() => setSidebarExpanded(false)}
          >
            <Sidebar />
          </ResizablePanel>

          <ResizableHandle className="bg-slate-900" />

          <ResizablePanel panelId={1} defaultSize={75}>
            <ResizablePanelGroup autoSaveId="code-editor" direction="vertical">
              <ResizablePanel panelId={0} defaultSize={80} minSize={20}>
                <Tabs
                  tabs={openFileList}
                  current={curTabIdx}
                  onChange={setCurTabIdx}
                  onClose={onCloseFile}
                />
              </ResizablePanel>

              <ResizableHandle />
              <ResizablePanel
                panelId={1}
                defaultSize={20}
                collapsible
                collapsedSize={0}
                minSize={10}
              >
                <ConsoleLogger />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>

        <Button
          variant="ghost"
          className="absolute bottom-0 left-0 w-12 h-12 rounded-none flex items-center justify-center"
          onClick={toggleSidebar}
        >
          {sidebarExpanded ? <FaCompressArrowsAlt /> : <FaCompress />}
        </Button>
      </PanelComponent>
    </EditorContext.Provider>
  );
};

export default Editor;
