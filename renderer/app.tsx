import React from "react";
import { PageContextProvider } from "./context";
import type { PageContext } from "vike/types";
import Providers from "./providers";
import "./globals.css";
import "nprogress/nprogress.css";

type AppProps = {
  children: React.ReactNode;
  pageContext: PageContext;
};

const App = ({ children, pageContext }: AppProps) => {
  const { Layout } = pageContext.config;

  return (
    <React.StrictMode>
      <PageContextProvider pageContext={pageContext}>
        <Providers>
          {Layout ? <Layout children={children} /> : children}
        </Providers>
      </PageContextProvider>
    </React.StrictMode>
  );
};

export default App;
