import React from "react";
import { cn } from "~/lib/utils";

type Props = React.ComponentProps<"hr">;

const Divider = ({ className, ...props }: Props) => {
  return <hr className={cn("border-white/20", className)} {...props} />;
};

export default Divider;
