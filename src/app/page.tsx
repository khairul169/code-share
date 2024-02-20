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
import FilePreview from "@/components/containers/file-preview";
import trpc from "@/lib/trpc";
import CreateFileDialog from "@/components/containers/createfile-dialog";
import { useDisclose } from "@/hooks/useDisclose";
import { Button } from "@/components/ui/button";
import { FaFileAlt } from "react-icons/fa";

const HomePage = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [isMounted, setMounted] = useState(false);
  const screen = useScreen();
  const isPortrait = screen?.width < screen?.height;

  const files = trpc.file.getAll.useQuery();
  const [curTabIdx, setCurTabIdx] = useState(0);
  const [curOpenFiles, setOpenFiles] = useState<number[]>([]);
  const createFileDlg = useDisclose();
  const [iframeLogs, setIframeLogs] = useState<any[]>([]);

  const refreshPreview = useCallback(() => {
    if (frameRef.current) {
      frameRef.current.src = `/api/file/index.html?index=true`;
    }
    setIframeLogs([]);
  }, []);

  useEffect(() => {
    setMounted(true);

    const onMessage = (event: MessageEvent<any>) => {
      const { data } = event;
      if (!data) {
        return;
      }

      if (!["log", "warn", "error"].includes(data.type) || !data.args?.length) {
        return;
      }

      if (data.args[0]?.includes("Babel transformer")) {
        return;
      }

      setIframeLogs((i) => [data, ...i]);
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [setIframeLogs]);

  useEffect(() => {
    if (isMounted) {
      refreshPreview();
    }
  }, [isMounted]);

  const onOpenFile = (fileId: number) => {
    const idx = curOpenFiles.indexOf(fileId);
    if (idx >= 0) {
      return setCurTabIdx(idx);
    }

    setOpenFiles((state) => {
      setCurTabIdx(state.length);
      return [...state, fileId];
    });
  };

  const onFileChange = (_fileId: number) => {
    refreshPreview();
  };

  useEffect(() => {
    if (files.data && files.data?.length > 0 && !curOpenFiles.length) {
      files.data.forEach((file) => onOpenFile(file.id));
    }
  }, [files.data]);

  const openFileList = useMemo(() => {
    return curOpenFiles.map((fileId) => {
      const fileData = files.data?.find((i) => i.id === fileId);

      return {
        title: fileData?.filename || "...",
        render: () => (
          <FilePreview id={fileId} onFileChange={() => onFileChange(fileId)} />
        ),
      };
    }) satisfies Tab[];
  }, [curOpenFiles, files]);

  if (!isMounted) {
    return null;
  }

  return (
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
                <div className="h-10 flex items-center pl-3">
                  <p className="text-xs uppercase truncate flex-1">
                    My Project
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 text-xs"
                    onClick={() => createFileDlg.onOpen()}
                  >
                    <FaFileAlt />
                  </Button>
                </div>
                <div className="flex flex-col items-stretch">
                  {files.data?.map((file) => (
                    <button
                      key={file.id}
                      className="text-slate-400 hover:text-white transition-colors text-sm flex items-center px-3 py-1.5"
                      onClick={() => onOpenFile(file.id)}
                    >
                      {file.filename}
                    </button>
                  ))}
                </div>

                <CreateFileDialog
                  disclose={createFileDlg}
                  onSuccess={(file, type) => {
                    files.refetch();
                    if (type === "create") {
                      onOpenFile(file.id);
                    }
                  }}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={isPortrait ? 100 : 75}>
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={100} minSize={20}>
                    <Tabs
                      tabs={openFileList}
                      current={curTabIdx}
                      onChange={setCurTabIdx}
                    />
                  </ResizablePanel>

                  {!isPortrait ? (
                    <>
                      <ResizableHandle />
                      <ResizablePanel
                        defaultSize={0}
                        collapsible
                        collapsedSize={0}
                        minSize={10}
                      >
                        <div className="pt-2 h-full border-t border-slate-700">
                          <div className="flex flex-col-reverse overflow-y-auto items-stretch h-full font-mono text-slate-400">
                            {iframeLogs.map((item, idx) => (
                              <p
                                key={idx}
                                className="text-xs border-b border-slate-900 first:border-b-0 px-2 py-1"
                              >
                                {item.args
                                  ?.map((arg: any) => {
                                    if (typeof arg === "object") {
                                      return JSON.stringify(arg, null, 2);
                                    }
                                    return arg;
                                  })
                                  .join(" ")}
                              </p>
                            ))}
                          </div>
                        </div>
                      </ResizablePanel>
                    </>
                  ) : null}
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
          <Panel>
            <iframe
              ref={frameRef}
              className="border-none w-full h-full bg-white"
              sandbox="allow-scripts"
            />
          </Panel>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default HomePage;
