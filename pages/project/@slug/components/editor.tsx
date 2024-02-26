import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useProjectContext } from "../context/project";
import Sidebar from "./sidebar";
import ConsoleLogger from "./console-logger";
import { useData } from "~/renderer/hooks";
import { Data } from "../+data";
import { useBreakpoint } from "~/hooks/useBreakpoint";
import StatusBar from "./status-bar";
import { FiServer, FiTerminal } from "react-icons/fi";
import SettingsDialog from "./settings-dialog";
import FileIcon from "~/components/ui/file-icon";
import APIManager from "./api-manager";
import { api } from "~/lib/api";

const Editor = () => {
  const { project, initialFiles } = useData<Data>();
  const trpcUtils = trpc.useUtils();
  const projectCtx = useProjectContext();
  const [breakpoint] = useBreakpoint();

  const [curTabIdx, setCurTabIdx] = useState(0);
  const [curOpenFiles, setOpenFiles] = useState<number[]>(
    initialFiles.map((i) => i.id)
  );

  const openedFilesData = trpc.file.getAll.useQuery(
    { projectId: project.id, id: curOpenFiles },
    { enabled: curOpenFiles.length > 0, initialData: initialFiles }
  );
  const [openedFiles, setOpenedFiles] = useState<any[]>(initialFiles);

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
    if (!initialFiles?.length || curOpenFiles.length > 0) {
      return;
    }

    initialFiles.forEach((file) => {
      onOpenFile(file.id, false);
    });

    return () => {
      setOpenFiles([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFiles]);

  useEffect(() => {
    if (openedFilesData.data) {
      setOpenedFiles(openedFilesData.data);
    }
  }, [openedFilesData.data]);

  useEffect(() => {
    // start API sandbox
    api(`/sandbox/${project.slug}/start`, { method: "POST" }).catch(() => {});
  }, [project]);

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

  const tabs = useMemo(() => {
    let tabs: Tab[] = [];

    // opened files
    tabs = tabs.concat(
      curOpenFiles.map((fileId) => {
        const fileData = openedFiles?.find((i) => i.id === fileId);
        const filename = fileData?.filename || "...";

        return {
          title: filename,
          icon: <FileIcon file={{ isDirectory: false, filename }} />,
          render: () => <FileViewer id={fileId} />,
        };
      })
    );

    // show console tab on mobile
    if (breakpoint < 2) {
      tabs.push({
        title: "Console",
        icon: <FiTerminal />,
        render: () => <ConsoleLogger />,
        locked: true,
      });
    }

    tabs.push({
      title: "API",
      icon: <FiServer />,
      render: () => <APIManager />,
      locked: true,
    });

    return tabs;
  }, [curOpenFiles, openedFiles, breakpoint]);

  const PanelComponent = !projectCtx.isCompact ? Panel : "div";

  return (
    <EditorContext.Provider
      value={{
        onOpenFile,
        onFileChanged,
        onDeleteFile,
      }}
    >
      <PanelComponent className="h-full relative flex flex-col">
        <ResizablePanelGroup
          autoSaveId="veditor-panel"
          direction="horizontal"
          className="flex-1 order-2 md:order-1"
        >
          <Sidebar
            defaultSize={{ sm: 50, md: 25 }}
            defaultCollapsed={{ sm: true, md: false }}
            minSize={10}
            collapsible
            collapsedSize={0}
          />

          <ResizableHandle className="w-0" />

          <ResizablePanel defaultSize={{ sm: 100, md: 75 }}>
            <ResizablePanelGroup autoSaveId="code-editor" direction="vertical">
              <ResizablePanel defaultSize={{ sm: 100, md: 80 }} minSize={20}>
                <Tabs
                  tabs={tabs}
                  current={Math.min(Math.max(curTabIdx, 0), tabs.length - 1)}
                  onChange={setCurTabIdx}
                  onClose={onCloseFile}
                  className="h-full"
                />
              </ResizablePanel>

              {breakpoint >= 2 ? (
                <>
                  <ResizableHandle className="!h-0" />

                  <ResizablePanel
                    defaultSize={{ sm: 0, md: 20 }}
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

        <StatusBar className="order-1 md:order-2" />
      </PanelComponent>

      <SettingsDialog />
    </EditorContext.Provider>
  );
};

export default Editor;
