import React from "react";
import { cn } from "~/lib/utils";

type Props = React.ComponentProps<"div">;

const Card = ({ className, ...props }: Props) => {
  return (
    <div
      className={cn(
        "bg-background border border-white/20 rounded-lg p-4",
        className
      )}
      {...props}
    />
  );
};

export const CardTitle = ({
  className,
  ...props
}: React.ComponentProps<"p">) => (
  <p className={cn("text-2xl mb-8", className)} {...props} />
);

export default Card;
