import React from "react";

type Props = {
  children?: React.ReactNode;
};

const Panel = ({ children }: Props) => {
  return (
    <div className="bg-slate-800 rounded-lg pt-9 w-full h-full relative shadow-lg overflow-hidden">
      <div className="flex gap-2 absolute top-3 left-4">
        <div className="bg-red-500 rounded-full h-3 w-3" />
        <div className="bg-yellow-500 rounded-full h-3 w-3" />
        <div className="bg-green-500 rounded-full h-3 w-3" />
      </div>
      {children}
    </div>
  );
};

export default Panel;
