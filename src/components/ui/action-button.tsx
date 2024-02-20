/* eslint-disable react/display-name */
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";
import { IconType } from "react-icons/lib";

type Props = React.ComponentProps<typeof Button> & {
  icon: IconType;
};

const ActionButton = forwardRef(
  ({ icon: Icon, className, onClick, ...props }: Props, ref: any) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn(
          "text-slate-400 hover:bg-transparent hover:dark:bg-transparent h-8 w-6 p-0",
          className
        )}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            e.stopPropagation();
            onClick(e);
          }
        }}
        {...props}
      >
        <Icon />
      </Button>
    );
  }
);

export default ActionButton;
