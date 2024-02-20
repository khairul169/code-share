"use client";

/* eslint-disable react/display-name */
import Panel from "@/components/ui/panel";
import { useParams } from "next/navigation";
import React, { Fragment, useCallback, useEffect, useRef } from "react";
import { createStore } from "zustand";
import { useProjectContext } from "../context/project";

type PreviewStore = {
  refresh: () => void;
};

export const previewStore = createStore<PreviewStore>(() => ({
  refresh: () => {},
}));

const WebPreview = () => {
  const { slug } = useParams();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const project = useProjectContext();

  const refresh = useCallback(() => {
    if (frameRef.current) {
      frameRef.current.src = `/project/${slug}/file/index.html?t=${Date.now()}`;
    }
  }, [slug]);

  useEffect(() => {
    previewStore.setState({ refresh });
    refresh();
  }, [refresh]);

  const PanelComponent = !project.isCompact ? Panel : Fragment;

  return (
    <PanelComponent>
      <iframe
        id="web-preview"
        ref={frameRef}
        className="border-none w-full h-full bg-white"
        sandbox="allow-scripts"
      />
    </PanelComponent>
  );
};

export default WebPreview;
