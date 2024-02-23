import React from "react";
import { FiSidebar, FiSmartphone, FiUser } from "react-icons/fi";
import { useStore } from "zustand";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { usePageContext } from "~/renderer/context";
import { sidebarStore } from "../stores/sidebar";
import ActionButton from "~/components/ui/action-button";
import { previewStore } from "../stores/web-preview";
import { useProjectContext } from "../context/project";

const StatusBar = ({ className }: React.ComponentProps<"div">) => {
  const { user, urlPathname } = usePageContext();
  const { isCompact } = useProjectContext();
  const sidebarExpanded = useStore(sidebarStore, (i) => i.expanded);
  const previewExpanded = useStore(previewStore, (i) => i.open);

  if (isCompact) {
    return null;
  }

  return (
    <div
      className={cn(
        "h-10 flex items-center gap-1 pl-2 pr-3 w-full bg-slate-900 md:bg-[#242424] border-b md:border-b-0 md:border-t border-slate-900 md:border-black/30",
        className
      )}
    >
      <ActionButton
        title="Toggle Sidebar"
        icon={FiSidebar}
        className={sidebarExpanded ? "text-white" : ""}
        onClick={() => sidebarStore.getState().toggle()}
      />
      <ActionButton
        title="Toggle Preview Window"
        icon={FiSmartphone}
        className={previewExpanded ? "text-white" : ""}
        onClick={() => previewStore.getState().toggle()}
      />

      <div className="flex-1"></div>
      <Button
        href={user ? "/user" : "/auth/login?return=" + urlPathname}
        className="h-full p-0 gap-2 text-xs"
        variant="link"
      >
        <FiUser className="text-sm" />
        {user?.name || "Log in"}
      </Button>
    </div>
  );
};

export default StatusBar;
