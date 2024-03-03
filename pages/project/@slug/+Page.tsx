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
  const isCompact = Boolean(searchParams.get("compact"));
  const isEmbed = Boolean(searchParams.get("embed"));
  const hidePreview = searchParams.get("preview") === "0";
  const previewUrl = getPreviewUrl(project, "index.html");

  return (
    <ProjectContext.Provider value={{ project, isCompact, isEmbed }}>
      <ResizablePanelGroup
        autoSaveId={!isEmbed ? "main-panel" : null}
        direction={{ sm: "vertical", md: "horizontal" }}
        className={cn("w-full !h-screen")}
      >
        <ResizablePanel
          defaultSize={hidePreview ? 100 : 60}
          collapsible
          collapsedSize={0}
          minSize={30}
        >
          <Editor />
        </ResizablePanel>
        <ResizableHandle withHandle={!isEmbed && !isCompact} />
        <WebPreview
          defaultSize={40}
          defaultCollapsed={hidePreview}
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
