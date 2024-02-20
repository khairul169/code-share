"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useScreen } from "usehooks-ts";
import Panel from "@/components/ui/panel";

import { cn } from "@/lib/utils";
import Tabs, { Tab } from "@/components/ui/tabs";
import FilePreview from "./_components/file-preview";
import trpc from "@/lib/trpc";
import FileListing from "./_components/file-listing";
import ProjectViewContext from "./context";
import WebPreview from "./_components/web-preview";
import type { FileSchema } from "@/server/db/schema/file";

const HomePage = () => {
  const webPreviewRef = useRef<any>(null);
  const consoleLoggerRef = useRef<any>(null);
  const [isMounted, setMounted] = useState(false);
  const screen = useScreen();
  const isPortrait = screen?.width < screen?.height;
  const trpcUtils = trpc.useUtils();

  const [curTabIdx, setCurTabIdx] = useState(0);
  const [curOpenFiles, setOpenFiles] = useState<number[]>([]);

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

  useEffect(() => {
    if (openedFilesData.data) {
      setOpenedFiles(openedFilesData.data);
    }
  }, [openedFilesData.data]);

  const refreshPreview = useCallback(() => {
    webPreviewRef.current?.refresh();
    consoleLoggerRef.current?.clear();
  }, []);

  useEffect(() => {
    if (isMounted) {
      refreshPreview();
    }
  }, [isMounted, refreshPreview]);

  const onOpenFile = useCallback(
    (fileId: number) => {
      const idx = curOpenFiles.indexOf(fileId);
      if (idx >= 0) {
        return setCurTabIdx(idx);
      }

      setOpenFiles((state) => {
        setCurTabIdx(state.length);
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

  const openFileList = useMemo(() => {
    return curOpenFiles.map((fileId) => {
      const fileData = openedFiles?.find((i) => i.id === fileId);

      return {
        title: fileData?.filename || "...",
        render: () => (
          <FilePreview id={fileId} onFileContentChange={refreshPreview} />
        ),
      };
    }) satisfies Tab[];
  }, [curOpenFiles, openedFiles, refreshPreview]);

  if (!isMounted) {
    return null;
  }

  return (
    <ProjectViewContext.Provider
      value={{
        onOpenFile,
        onFileChanged,
        onDeleteFile,
      }}
    >
      <ResizablePanelGroup
        autoSaveId="main-panel"
        direction={isPortrait ? "vertical" : "horizontal"}
        className="w-full !h-dvh"
      >
        <ResizablePanel
          defaultSize={isPortrait ? 50 : 60}
          collapsible
          collapsedSize={0}
          minSize={isPortrait ? 10 : 30}
        >
          <div
            className={cn(
              "w-full h-full p-2 pb-0",
              !isPortrait ? "p-4 pb-4 pr-0" : ""
            )}
          >
            <Panel>
              <ResizablePanelGroup
                autoSaveId="veditor-panel"
                direction="horizontal"
              >
                <ResizablePanel
                  defaultSize={isPortrait ? 0 : 25}
                  minSize={10}
                  collapsible
                  collapsedSize={0}
                  className="bg-[#1e2536]"
                >
                  <FileListing />
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={isPortrait ? 100 : 75}>
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={100} minSize={20}>
                      <Tabs
                        tabs={openFileList}
                        current={curTabIdx}
                        onChange={setCurTabIdx}
                        onClose={onCloseFile}
                      />
                    </ResizablePanel>

                    {/* {!isPortrait ? (
                      <>
                        <ResizableHandle />
                        <ResizablePanel
                          defaultSize={0}
                          collapsible
                          collapsedSize={0}
                          minSize={10}
                        >
                          <ConsoleLogger ref={consoleLoggerRef} />
                        </ResizablePanel>
                      </>
                    ) : null} */}
                  </ResizablePanelGroup>
                </ResizablePanel>
              </ResizablePanelGroup>
            </Panel>
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className="bg-transparent hover:bg-slate-500 transition-colors md:mx-1 w-2 data-[panel-group-direction=vertical]:h-2 rounded-lg"
        />
        <ResizablePanel
          defaultSize={isPortrait ? 50 : 40}
          collapsible
          collapsedSize={0}
          minSize={10}
        >
          <div
            className={cn(
              "w-full h-full p-2 pt-0",
              !isPortrait ? "p-4 pt-4 pl-0" : ""
            )}
          >
            <WebPreview ref={webPreviewRef} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ProjectViewContext.Provider>
  );
};

export default HomePage;
