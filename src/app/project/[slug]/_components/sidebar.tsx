import React from "react";
import FileListing from "./file-listing";
import { FaUserCircle } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  return (
    <aside className="flex flex-col items-stretch h-full">
      <FileListing />
      <div className="h-12 bg-[#1a1b26] pl-12">
        <Button
          variant="ghost"
          className="h-12 w-full truncate flex justify-start text-left uppercase text-xs rounded-none"
        >
          <FaUserCircle className="mr-2 text-xl" />
          <span className="truncate">Log in</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
