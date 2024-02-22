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
import { usePortrait } from "~/hooks/usePortrait";
import Panel from "~/components/ui/panel";
import { previewStore } from "../stores/web-preview";
import { useProjectContext } from "../context/project";
import { ImperativePanelHandle } from "react-resizable-panels";
import Sidebar from "./sidebar";
import useCommandKey from "~/hooks/useCommandKey";
import { Button } from "~/components/ui/button";
import { FaCompress, FaCompressArrowsAlt } from "react-icons/fa";
import ConsoleLogger from "./console-logger";

const Editor = () => {
  const isPortrait = usePortrait();
  const trpcUtils = trpc.useUtils();
  const [isMounted, setMounted] = useState(false);
  const project = useProjectContext();
  const sidebarPanel = useRef<ImperativePanelHandle>(null);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [curTabIdx, setCurTabIdx] = useState(0);
  const [curOpenFiles, setOpenFiles] = useState<number[]>([]);

  const pinnedFiles = trpc.file.getAll.useQuery(
    { isPinned: true },
    { enabled: !isMounted }
  );
  const openedFilesData = trpc.file.getAll.useQuery(
    { id: curOpenFiles },
    { enabled: curOpenFiles.length > 0 }
  );
  const [openedFiles, setOpenedFiles] = useState<any[]>([]);

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

  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!pinnedFiles.data?.length || curOpenFiles.length > 0) {
      return;
    }

    pinnedFiles.data.forEach((file) => {
      onOpenFile(file.id, false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedFiles.data]);

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
            defaultSize={isPortrait ? 0 : 25}
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

          <ResizablePanel defaultSize={isPortrait ? 100 : 75}>
            <ResizablePanelGroup
              autoCapitalize="code-editor"
              direction="vertical"
            >
              <ResizablePanel defaultSize={isPortrait ? 100 : 80} minSize={20}>
                <Tabs
                  tabs={openFileList}
                  current={curTabIdx}
                  onChange={setCurTabIdx}
                  onClose={onCloseFile}
                />
              </ResizablePanel>

              {!isPortrait ? (
                <>
                  <ResizableHandle />
                  <ResizablePanel
                    defaultSize={20}
                    collapsible
                    collapsedSize={0}
                    minSize={10}
                  >
                    <ConsoleLogger />
                  </ResizablePanel>
                </>
              ) : null}
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
