import React from "react";
import { cn } from "~/lib/utils";

type Props = {
  size?: "sm" | "md" | "lg";
};

const Logo = ({ size = "md" }: Props) => {
  const sizes: Record<typeof size, string> = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <p
      className={cn(
        "text-xl font-bold text-transparent bg-gradient-to-b from-gray-200 to-gray-100 bg-clip-text",
        sizes[size]
      )}
    >
      CodeShare
    </p>
  );
};

export default Logo;
