import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import WebPreview from "./components/web-preview";
import Editor from "./components/editor";
import ProjectContext from "./context/project";
import { cn } from "~/lib/utils";
import { useParams, useSearchParams } from "~/renderer/hooks";
import { BASE_URL } from "~/lib/consts";
import { withClientOnly } from "~/renderer/client-only";
import Spinner from "~/components/ui/spinner";

const ViewProjectPage = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const isCompact =
    searchParams.get("compact") === "1" || searchParams.get("embed") === "1";
  const slug = params["slug"];
  const previewUrl = BASE_URL + `/api/preview/${slug}/index.html`;

  return (
    <ProjectContext.Provider value={{ slug, isCompact }}>
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
              ? "bg-slate-800 md:bg-transparent hover:bg-slate-500 transition-colors md:mx-1 w-2 md:data-[panel-group-direction=vertical]:h-2 rounded-lg"
              : "bg-slate-800"
          }
        />
        <ResizablePanel
          defaultSize={40}
          collapsible
          collapsedSize={0}
          minSize={10}
        >
          <WebPreview url={previewUrl} />
        </ResizablePanel>
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
