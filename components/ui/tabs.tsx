import { cn } from "~/lib/utils";
import React, { useEffect, useMemo, useRef } from "react";
import ActionButton from "./action-button";
import { FiX } from "react-icons/fi";
import FileIcon from "./file-icon";

export type Tab = {
  title: string;
  icon?: React.ReactNode;
  render?: () => React.ReactNode;
};

type Props = {
  tabs: Tab[];
  current?: number;
  onChange?: (idx: number) => void;
  onClose?: (idx: number) => void;
};

const Tabs = ({ tabs, current = 0, onChange, onClose }: Props) => {
  const tabContainerRef = useRef<HTMLDivElement>(null);

  const onWheel = (e: WheelEvent) => {
    e.cancelable && e.preventDefault();
    if (tabContainerRef.current) {
      tabContainerRef.current.scrollLeft += e.deltaY + e.deltaX;
    }
  };

  useEffect(() => {
    if (!tabs.length || !tabContainerRef.current) {
      return;
    }

    const container = tabContainerRef.current;
    container.addEventListener("wheel", onWheel);
    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, [tabs]);

  useEffect(() => {
    if (!tabs.length) {
      return;
    }

    const container = tabContainerRef.current;
    const tabEl: any = container?.querySelector(`[data-idx="${current}"]`);
    if (!container || !tabEl) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const scrollX = tabEl.offsetLeft - containerRect.left;
    container.scrollTo({ left: scrollX, behavior: "smooth" });
  }, [tabs, current]);

  const tabView = useMemo(() => {
    const tab = tabs[current];
    const element = tab?.render ? tab.render() : null;
    return element;
  }, [tabs, current]);

  return (
    <div className="w-full h-full flex flex-col items-stretch bg-slate-800">
      {tabs.length > 0 ? (
        <nav
          ref={tabContainerRef}
          className="flex items-stretch overflow-x-auto w-full h-10 min-h-10 hide-scrollbar"
        >
          {tabs.map((tab, idx) => (
            <TabItem
              key={idx}
              index={idx}
              title={tab.title}
              icon={tab.icon}
              isActive={idx === current}
              onSelect={() => onChange && onChange(idx)}
              onClose={() => onClose && onClose(idx)}
            />
          ))}
        </nav>
      ) : null}

      <main className="flex-1 overflow-hidden">{tabView}</main>
    </div>
  );
};

type TabItemProps = {
  index: number;
  title: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onSelect: () => void;
  onClose: () => void;
};

const TabItem = ({
  index,
  title,
  isActive,
  onSelect,
  onClose,
}: TabItemProps) => {
  const lastDotFile = title.lastIndexOf(".");
  const ext = title.substring(lastDotFile);
  const filename = title.substring(0, lastDotFile);

  return (
    <div
      data-idx={index}
      className={cn(
        "group border-b-2 border-transparent truncate flex-shrink-0 text-white/70 transition-all hover:text-white text-center max-w-[140px] md:max-w-[180px] text-sm flex items-center gap-0 relative z-[1]",
        isActive ? "border-slate-500 text-white" : ""
      )}
      onClick={onSelect}
    >
      <button className="pl-4 pr-0 truncate flex items-center self-stretch">
        <FileIcon
          file={{ isDirectory: false, filename: title }}
          className="mr-1"
        />
        <span className="truncate">{filename}</span>
        <span>{ext}</span>
      </button>
      <ActionButton
        icon={FiX}
        className="opacity-0 group-hover:opacity-100 transition-colors"
        onClick={onClose}
      />
    </div>
  );
};

export default Tabs;
