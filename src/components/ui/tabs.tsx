import { cn, getFileExt } from "@/lib/utils";
import React, { useMemo, useState } from "react";

export type Tab = {
  title: string;
  icon?: React.ReactNode;
  render?: () => React.ReactNode;
};

type Props = {
  tabs: Tab[];
  current?: number;
  onChange?: (idx: number) => void;
};

const Tabs = ({ tabs, current = 0, onChange }: Props) => {
  const tabView = useMemo(() => {
    const tab = tabs[current];
    const element = tab?.render ? tab.render() : null;
    return element;
  }, [tabs, current]);

  return (
    <div className="w-full h-full flex flex-col items-stretch bg-slate-800">
      {tabs.length > 0 ? (
        <nav className="flex items-stretch overflow-x-auto w-full h-10 min-h-10 hide-scrollbar">
          {tabs.map((tab, idx) => (
            <TabItem
              key={idx}
              title={tab.title}
              icon={tab.icon}
              isActive={idx === current}
              onSelect={() => onChange && onChange(idx)}
              onClose={() => {}}
            />
          ))}
        </nav>
      ) : null}

      <main className="flex-1 overflow-hidden">{tabView}</main>
    </div>
  );
};

type TabItemProps = {
  title: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  onSelect: () => void;
  onClose: () => void;
};

const TabItem = ({
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
    <button
      className={cn(
        "border-b-2 border-transparent text-white text-center max-w-[140px] md:max-w-[180px] px-4 text-sm flex items-center gap-0 relative z-[1]",
        isActive ? "border-slate-500" : ""
      )}
      onClick={onSelect}
    >
      <span className="truncate">{filename}</span>
      <span>{ext}</span>
    </button>
  );
};

export default Tabs;
