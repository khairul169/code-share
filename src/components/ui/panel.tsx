import React from "react";

type Props = {
  children?: React.ReactNode;
};

const Panel = ({ children }: Props) => {
  return (
    <div className="bg-slate-800 rounded-lg w-full h-full flex flex-col items-stretch shadow-lg overflow-hidden">
      <div className="flex gap-2 py-3 px-4">
        <div className="bg-red-500 rounded-full h-3 w-3" />
        <div className="bg-yellow-500 rounded-full h-3 w-3" />
        <div className="bg-green-500 rounded-full h-3 w-3" />
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};

export default Panel;
