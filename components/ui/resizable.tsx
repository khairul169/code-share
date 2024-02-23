import { GripVertical } from "lucide-react";
import { forwardRef } from "react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "~/lib/utils";
import {
  BreakpointValues,
  useBreakpointValue,
} from "~/hooks/useBreakpointValue";

type Direction = "horizontal" | "vertical";

type ResizablePanelGroupProps = Omit<
  React.ComponentProps<typeof ResizablePrimitive.PanelGroup>,
  "direction"
> & {
  direction: Direction | BreakpointValues<Direction>;
};

const ResizablePanelGroup = ({
  className,
  direction,
  ...props
}: ResizablePanelGroupProps) => {
  const directionValue = useBreakpointValue(direction);

  return (
    <ResizablePrimitive.PanelGroup
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      direction={directionValue}
      {...props}
    />
  );
};

type ResizablePanelProps = Omit<
  React.ComponentProps<typeof ResizablePrimitive.Panel>,
  "defaultSize"
> & {
  defaultSize: number | BreakpointValues<number>;
  defaultCollapsed?: boolean | BreakpointValues<boolean>;
};

const ResizablePanel = forwardRef((props: ResizablePanelProps, ref: any) => {
  const { defaultSize, defaultCollapsed, ...restProps } = props;
  const initialSize = useBreakpointValue(defaultSize);
  const initialCollapsed = useBreakpointValue(defaultCollapsed);

  return (
    <ResizablePrimitive.Panel
      ref={ref}
      defaultSize={initialCollapsed ? 0 : initialSize}
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
