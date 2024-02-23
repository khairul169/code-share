/* eslint-disable react/display-name */
import Panel from "~/components/ui/panel";
import { ComponentProps, useCallback, useEffect, useRef } from "react";
import { useProjectContext } from "../context/project";
import { Button } from "~/components/ui/button";
import { FaRedo } from "react-icons/fa";
import { previewStore } from "../stores/web-preview";
import { ImperativePanelHandle } from "react-resizable-panels";
import useCommandKey from "~/hooks/useCommandKey";
import { ResizablePanel } from "~/components/ui/resizable";
import { useConsoleLogger } from "~/hooks/useConsoleLogger";

type WebPreviewProps = ComponentProps<typeof ResizablePanel> & {
  url?: string | null;
};

const WebPreview = ({ url, ...props }: WebPreviewProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const panelRef = useRef<ImperativePanelHandle>(null);
  const project = useProjectContext();

  // hook into the console
  useConsoleLogger();

  const refresh = useCallback(() => {
    if (frameRef.current) {
      frameRef.current.src = `${url}?t=${Date.now()}`;
    }
  }, [url]);

  const togglePanel = useCallback(
    (toggle?: boolean) => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      const expand = toggle != null ? toggle : !panel.isCollapsed();

      if (expand) {
        panel.collapse();
      } else {
        panel.expand();
        panel.resize(
          typeof props.defaultSize === "number" ? props.defaultSize : 25
        );
      }
    },
    [panelRef, props.defaultSize]
  );

  useCommandKey("p", togglePanel);

  useEffect(() => {
    previewStore.setState({ refresh, toggle: togglePanel });
    refresh();
  }, [refresh, togglePanel]);

  const PanelComponent = !project.isCompact ? Panel : "div";

  return (
    <ResizablePanel
      ref={panelRef}
      onExpand={() => previewStore.setState({ open: true })}
      onCollapse={() => previewStore.setState({ open: false })}
      {...props}
    >
      <PanelComponent className="h-full flex flex-col bg-slate-800">
        <div className="h-10 hidden md:flex items-center pl-4">
          <p className="flex-1 truncate text-xs uppercase">Preview</p>
          <Button
            variant="ghost"
            className="dark:hover:bg-slate-700"
            onClick={refresh}
          >
            <FaRedo />
          </Button>
        </div>

        {url != null ? (
          <iframe
            id="web-preview"
            ref={frameRef}
            className="border-none w-full flex-1 overflow-hidden bg-white"
            sandbox="allow-scripts"
          />
        ) : null}
      </PanelComponent>
    </ResizablePanel>
  );
};

export default WebPreview;
