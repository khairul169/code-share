import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

const Panel = ({ children, className }: Props) => {
  return (
    <div className="bg-slate-800 w-full h-full flex-col items-stretch md:rounded-lg md:overflow-hidden flex">
      <div className="gap-2 py-3 px-4 hidden md:flex">
        <div className="bg-red-500 rounded-full h-3 w-3" />
        <div className="bg-yellow-500 rounded-full h-3 w-3" />
        <div className="bg-green-500 rounded-full h-3 w-3" />
      </div>
      <div className={cn("flex-1 overflow-hidden", className)}>{children}</div>
    </div>
  );
};

export default Panel;
