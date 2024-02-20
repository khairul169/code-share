"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import WebPreview from "./_components/web-preview";
import { usePortrait } from "@/hooks/usePortrait";
import Editor from "./_components/editor";
import ProjectContext from "./context/project";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const ViewProjectPage = () => {
  const [isMounted, setMounted] = useState(false);
  const isPortrait = usePortrait();
  const searchParams = useSearchParams();
  const isCompact =
    searchParams.get("compact") === "1" || searchParams.get("embed") === "1";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <ProjectContext.Provider value={{ isCompact }}>
      <ResizablePanelGroup
        autoSaveId="main-panel"
        direction={isPortrait ? "vertical" : "horizontal"}
        className={cn("w-full !h-dvh", !isCompact ? "md:p-4" : "")}
      >
        <ResizablePanel
          defaultSize={isPortrait ? 50 : 60}
          collapsible
          collapsedSize={0}
          minSize={isPortrait ? 10 : 30}
        >
          <Editor />
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className={
            !isCompact
              ? "bg-slate-800 md:bg-transparent hover:bg-slate-500 transition-colors md:mx-1 w-2 md:data-[panel-group-direction=vertical]:h-2 rounded-lg"
              : "bg-slate-800"
          }
        />
        <ResizablePanel
          defaultSize={isPortrait ? 50 : 40}
          collapsible
          collapsedSize={0}
          minSize={10}
        >
          <WebPreview />
        </ResizablePanel>
      </ResizablePanelGroup>
    </ProjectContext.Provider>
  );
};

export default ViewProjectPage;
