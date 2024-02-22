import { ComponentProps } from "react";
import { usePageContext } from "./context";

const Link = (props: ComponentProps<"a">) => {
  const pageContext = usePageContext();
  const { urlPathname } = pageContext;
  const { href } = props;

  const isActive =
    href === "/" ? urlPathname === href : urlPathname.startsWith(href!);

  const className = [props.className, isActive && "is-active"]
    .filter(Boolean)
    .join(" ");

  return <a {...props} className={className} />;
};

export default Link;
