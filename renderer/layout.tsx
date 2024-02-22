import React from "react";
import { PageContextProvider } from "./context";
import type { PageContext } from "vike/types";
import Providers from "./providers";
import "./globals.css";
import "nprogress/nprogress.css";

type LayoutProps = {
  children: React.ReactNode;
  pageContext: PageContext;
};

const Layout = ({ children, pageContext }: LayoutProps) => {
  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <Providers>{children}</Providers>
      </PageContextProvider>
    </React.StrictMode>
  );
};

export default Layout;
