import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";

type ClientOnlyProps = {
  children: ReactNode;
  fallback?: () => JSX.Element | null;
};

const ClientOnly = ({ children, fallback }: ClientOnlyProps) => {
  const [isMounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (typeof window === "undefined") {
    return fallback ? fallback() : null;
  }

  if (isMounted) {
    return children;
  }

  return fallback ? fallback() : null;
};

export const withClientOnly = <T extends unknown>(
  Component: React.ComponentType<T>,
  fallback?: () => JSX.Element | null
): React.ComponentType<T> => {
  return (props: any) => (
    <ClientOnly fallback={fallback}>
      <Component {...props} />
    </ClientOnly>
  );
};

export default ClientOnly;
