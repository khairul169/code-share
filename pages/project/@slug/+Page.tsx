import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import WebPreview from "./components/web-preview";
import Editor from "./components/editor";
import ProjectContext from "./context/project";
import { cn, getPreviewUrl } from "~/lib/utils";
import { useData, useSearchParams } from "~/renderer/hooks";
import { withClientOnly } from "~/renderer/client-only";
import Spinner from "~/components/ui/spinner";
import { Data } from "./+data";

const ViewProjectPage = () => {
  const { project } = useData<Data>();
  const searchParams = useSearchParams();
  const isCompact = !!(
    searchParams.get("compact") || searchParams.get("embed")
  );
  const previewUrl = getPreviewUrl(project, "index.html");

  return (
    <ProjectContext.Provider value={{ project, isCompact }}>
      <ResizablePanelGroup
        autoSaveId="main-panel"
        direction={{ sm: "vertical", md: "horizontal" }}
        className={cn("w-full !h-dvh bg-slate-600", !isCompact ? "md:p-4" : "")}
      >
        <ResizablePanel
          defaultSize={60}
          collapsible
          collapsedSize={0}
          minSize={30}
        >
          <Editor />
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className={
            !isCompact
              ? "bg-slate-800 md:bg-transparent hover:bg-slate-500 transition-colors md:mx-1 w-2 md:data-[panel-group-direction=vertical]:h-2 md:rounded-lg"
              : "bg-slate-800"
          }
        />
        <WebPreview
          defaultSize={40}
          collapsible
          collapsedSize={0}
          minSize={10}
          url={previewUrl}
        />
      </ResizablePanelGroup>
    </ProjectContext.Provider>
  );
};

const LoadingPage = () => {
  return (
    <div className="flex w-full h-dvh items-center justify-center">
      <Spinner />
    </div>
  );
};

export default withClientOnly(ViewProjectPage, LoadingPage);
