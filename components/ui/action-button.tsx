/* eslint-disable react/display-name */
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import React, { forwardRef } from "react";
import { IconType } from "react-icons/lib";
import { VariantProps, cva } from "class-variance-authority";

const variants = cva(
  "text-slate-400 hover:bg-transparent hover:dark:bg-transparent p-0 flex-shrink-0",
  {
    variants: {
      size: {
        sm: "h-8 w-6",
        md: "h-8 w-8",
        lg: "h-10 w-10",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
);

type Props = Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof variants> & {
    icon: IconType;
  };

const ActionButton = forwardRef(
  ({ icon: Icon, className, size, onClick, ...props }: Props, ref: any) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn(variants({ size }), className)}
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
