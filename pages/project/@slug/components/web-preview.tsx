/* eslint-disable react/display-name */
import Panel from "~/components/ui/panel";
import { useCallback, useEffect, useRef } from "react";
import { useProjectContext } from "../context/project";
import { Button } from "~/components/ui/button";
import { FaEllipsisV, FaRedo } from "react-icons/fa";
import { Input } from "~/components/ui/input";
import { previewStore } from "../stores/web-preview";

type WebPreviewProps = {
  url?: string | null;
};

const WebPreview = ({ url }: WebPreviewProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const project = useProjectContext();

  const refresh = useCallback(() => {
    if (frameRef.current) {
      frameRef.current.src = `${url}?t=${Date.now()}`;
    }
  }, [url]);

  useEffect(() => {
    previewStore.setState({ refresh });
    refresh();
  }, [refresh]);

  const PanelComponent = !project.isCompact ? Panel : "div";

  return (
    <PanelComponent className="h-full flex flex-col bg-slate-800">
      <div className="h-10 flex items-center">
        <Button
          variant="ghost"
          className="dark:hover:bg-slate-700"
          onClick={refresh}
        >
          <FaRedo />
        </Button>
        <Input
          className="flex-1 dark:bg-gray-900 dark:hover:bg-gray-950 h-8 rounded-full"
          value={url || ""}
          readOnly
        />
        <Button
          variant="ghost"
          className="dark:hover:bg-slate-700"
          onClick={() => {}}
        >
          <FaEllipsisV />
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
  );
};

export default WebPreview;