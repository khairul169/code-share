import { ComponentProps, useCallback, useEffect, useRef } from "react";
import FileListing from "./file-listing";
import { ImperativePanelHandle } from "react-resizable-panels";
import useCommandKey from "~/hooks/useCommandKey";
import { sidebarStore } from "../stores/sidebar";
import { ResizablePanel } from "~/components/ui/resizable";
import { useBreakpointValue } from "~/hooks/useBreakpointValue";

type SidebarProps = ComponentProps<typeof ResizablePanel>;

const Sidebar = (props: SidebarProps) => {
  const sidebarPanel = useRef<ImperativePanelHandle>(null);
  const defaultSize = useBreakpointValue(props.defaultSize);

  const toggleSidebar = useCallback(
    (toggle?: boolean) => {
      const sidebar = sidebarPanel.current;
      if (!sidebar) {
        return;
      }

      const expand = toggle != null ? toggle : !sidebar.isCollapsed();

      if (expand) {
        sidebar.collapse();
      } else {
        sidebar.expand();
        sidebar.resize(defaultSize);
      }
    },
    [sidebarPanel, defaultSize]
  );

  useCommandKey("b", toggleSidebar);
  useEffect(() => {
    sidebarStore.setState({ toggle: toggleSidebar });
  }, [toggleSidebar]);

  return (
    <ResizablePanel
      ref={sidebarPanel}
      className="bg-[#1e2536]"
      onExpand={() => sidebarStore.setState({ expanded: true })}
      onCollapse={() => sidebarStore.setState({ expanded: false })}
      {...props}
    >
      <aside className="flex flex-col items-stretch h-full">
        <FileListing />
      </aside>
    </ResizablePanel>
  );
};

export default Sidebar;
