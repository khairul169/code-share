import { cn } from "~/lib/utils";
import React, { useEffect, useMemo, useRef } from "react";
import ActionButton from "./action-button";
import { FiX } from "react-icons/fi";

export type Tab = {
  title: string;
  icon?: React.ReactNode;
  render?: () => React.ReactNode;
  locked?: boolean;
};

type Props = {
  tabs: Tab[];
  current?: number;
  onChange?: (idx: number) => void;
  onClose?: (idx: number) => void;
  className?: string;
  containerClassName?: string;
};

const Tabs = ({
  tabs,
  current = 0,
  onChange,
  onClose,
  className,
  containerClassName,
}: Props) => {
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
    <div
      className={cn(
        "w-full flex flex-col items-stretch bg-slate-800",
        className
      )}
    >
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
              onClose={!tab.locked && onClose ? () => onClose(idx) : null}
            />
          ))}
        </nav>
      ) : null}

      <main className={cn("flex-1 overflow-hidden", containerClassName)}>
        {tabView}
      </main>
    </div>
  );
};

type TabItemProps = {
  index: number;
  title: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onSelect: () => void;
  onClose?: (() => void) | null;
};

const TabItem = ({
  index,
  title,
  icon,
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
      <button
        type="button"
        className={cn(
          "pl-4 pr-4 truncate flex items-center self-stretch",
          onClose ? "pr-0" : ""
        )}
      >
        {icon}
        <span className={cn("inline-block truncate", icon ? "ml-2" : "")}>
          {filename}
        </span>
        <span>{ext}</span>
      </button>

      {onClose ? (
        <ActionButton
          icon={FiX}
          className="opacity-0 group-hover:opacity-100 transition-colors"
          onClick={() => onClose()}
        />
      ) : null}
    </div>
  );
};

export default Tabs;
