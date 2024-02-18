"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Panel from "@/components/ui/panel";
import CodeEditor from "@/components/ui/code-editor";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";

import prettier from "prettier/standalone";
import prettierHtmlPlugin from "prettier/plugins/html";

const HomePage = () => {
  const codeMirror = useRef<ReactCodeMirrorRef>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [isMounted, setMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 639px)");
  const [data, setData] = useState("");
  const [lang, setLang] = useState("html");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (frameRef.current) {
      frameRef.current.srcdoc = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <title>Code-Share</title>
      </head>
      <body>
        ${data}
      </body>
      </html>
      `;
    }
  }, [data]);

  const onFormat = useCallback(async () => {
    const cursor = codeMirror.current?.view?.state.selection.main.head || 0;

    const { formatted, cursorOffset } = await prettier.formatWithCursor(data, {
      parser: "html",
      plugins: [prettierHtmlPlugin],
      cursorOffset: cursor,
    });

    const cm = codeMirror.current?.view;
    setData(formatted);
    cm?.dispatch({
      changes: { from: 0, to: cm?.state.doc.length, insert: formatted },
    });
    cm?.dispatch({
      selection: { anchor: cursorOffset },
    });

    // setTimeout(() => {
    // }, 100);
  }, [data, setData]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        onFormat();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onFormat]);

  if (!isMounted) {
    return null;
  }

  return (
    <ResizablePanelGroup
      autoSaveId="main-panel"
      direction={isMobile ? "vertical" : "horizontal"}
      className="w-full !h-dvh"
    >
      <ResizablePanel
        defaultSize={isMobile ? 50 : 60}
        minSize={20}
        className="p-4 pr-0"
      >
        <Panel>
          <ResizablePanelGroup
            autoSaveId="editor-panel"
            direction="horizontal"
            className="border-t border-t-slate-900"
          >
            <ResizablePanel
              defaultSize={25}
              minSize={10}
              collapsible
              collapsedSize={0}
              className="bg-[#1e2536]"
            >
              File List
            </ResizablePanel>
            <ResizableHandle className="bg-slate-900" />
            <ResizablePanel defaultSize={75}>
              <button onClick={() => setLang("html")}>HTML</button>
              <button onClick={() => setLang("css")}>CSS</button>
              <button onClick={() => setLang("js")}>Javascript</button>
              <button onClick={onFormat}>Format</button>

              <CodeEditor
                ref={codeMirror}
                lang={lang}
                value={data}
                onChange={setData}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </Panel>
      </ResizablePanel>
      <ResizableHandle className="bg-transparent hover:bg-slate-500 transition-colors mx-1 my-4 w-2 rounded-lg" />
      <ResizablePanel
        defaultSize={isMobile ? 50 : 40}
        collapsible
        collapsedSize={0}
        minSize={10}
      >
        <div className="w-full h-full p-4 pl-0">
          <Panel>
            <iframe
              ref={frameRef}
              className="border-none w-full h-full bg-white"
            />
          </Panel>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default HomePage;
