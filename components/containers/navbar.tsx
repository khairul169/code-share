import React, { ComponentProps } from "react";
import { cn } from "~/lib/utils";
import Link from "~/renderer/link";
import { Button } from "../ui/button";
import Logo from "./logo";
import { useAuth } from "~/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FaChevronDown } from "react-icons/fa";
import trpc from "~/lib/trpc";
import { usePageContext } from "~/renderer/context";

const Navbar = () => {
  const { user, urlPathname } = usePageContext();
  const logout = trpc.auth.logout.useMutation({
    onSuccess() {
      window.location.reload();
    },
  });

  return (
    <>
      <div className="h-16" />

      <header className="h-16 bg-background fixed z-20 top-0 left-0 w-full border-b border-white/20">
        <div className="h-full container max-w-5xl flex items-center gap-3">
          <Logo />

          <NavMenu className="md:ml-8 flex-1">
            <NavItem href="/">Home</NavItem>
            {/* <NavItem href="/browse">Browse</NavItem> */}
          </NavMenu>

          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-3 px-0">
                    <div className="size-8 rounded-full bg-white/40" />
                    <p>{user.name}</p>
                    <FaChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/projects">My Projects</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout.mutate()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button href={"/auth/login?return=" + urlPathname}>Log in</Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

const NavMenu = ({ children, className }: ComponentProps<"nav">) => (
  <nav className={cn("flex items-stretch h-full gap-6", className)}>
    {children}
  </nav>
);

type NavItemProps = {
  href?: string;
  children?: React.ReactNode;
};

const NavItem = ({ href, children }: NavItemProps) => {
  return (
    <Link
      href={href}
      className="flex items-center text-white/70 data-[active]:text-white hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
};

export default Navbar;
