import React from "react";
import { usePageContext } from "./context";
import { Slot } from "@radix-ui/react-slot";

type LinkProps = {
  href?: string;
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
};

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ asChild, href, ...props }, ref) => {
    const pageContext = usePageContext();
    const { urlPathname } = pageContext;
    const Comp = asChild ? Slot : "a";

    const isActive =
      href === "/" ? urlPathname === href : urlPathname.startsWith(href!);

    return (
      <Comp
        ref={ref}
        data-active={isActive || undefined}
        href={href}
        {...props}
      />
    );
  }
);

export default Link;
