import { GripVertical } from "lucide-react";
import { createContext, forwardRef, useContext } from "react";
import * as ResizablePrimitive from "react-resizable-panels";
import cookieJs from "cookiejs";

import { cn } from "~/lib/utils";
import { usePageContext } from "~/renderer/context";
import { useDebounce } from "~/hooks/useDebounce";

const ResizableContext = createContext<{ initialSize: number[] }>(null!);

const ResizablePanelGroup = ({
  className,
  autoSaveId,
  direction,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => {
  const { cookies } = usePageContext();
  const [debouncePersistLayout] = useDebounce((sizes: number[]) => {
    if (autoSaveId && typeof window !== "undefined") {
      cookieJs.set(panelKey, JSON.stringify(sizes));
    }
  }, 500);

  const panelKey = ["panel", direction, autoSaveId].join(":");
  let initialSize: number[] = [];

  if (autoSaveId && cookies && cookies[panelKey]) {
    initialSize = JSON.parse(cookies[panelKey]) || [];
  }

  const onLayout = (sizes: number[]) => {
    if (props.onLayout) {
      props.onLayout(sizes);
    }
    debouncePersistLayout(sizes);
  };

  return (
    <ResizableContext.Provider value={{ initialSize }}>
      <ResizablePrimitive.PanelGroup
        className={cn(
          "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
          className
        )}
        {...props}
        direction={direction}
        onLayout={onLayout}
      />
    </ResizableContext.Provider>
  );
};

type ResizablePanelProps = React.ComponentProps<
  typeof ResizablePrimitive.Panel
> & {
  panelId: number;
};

const ResizablePanel = forwardRef((props: ResizablePanelProps, ref: any) => {
  const { panelId, defaultSize, ...restProps } = props;
  const ctx = useContext(ResizableContext);
  let initialSize = defaultSize;

  if (panelId != null) {
    const size = ctx?.initialSize[panelId];
    if (size != null) {
      initialSize = size;
    }
  }

  return (
    <ResizablePrimitive.Panel
      ref={ref}
      defaultSize={initialSize}
      {...restProps}
    />
  );
});

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
