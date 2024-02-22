import type { Request } from "express";

declare global {
  namespace Vike {
    interface PageContext {
      Page: () => React.ReactElement;
      data?: {
        title?: string;
        description?: string;
      };
      config: {
        title?: string;
        description?: string;
      };
      abortReason?: string;
      req: Request;
      cookies: Record<string, string>;
    }
  }
}

export {};
