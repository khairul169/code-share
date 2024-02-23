import type { Request, Response } from "express";
import type { UserSchema } from "~/server/db/schema/user";

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
        Layout?: (props: { children: React.ReactNode }) => React.ReactElement;
      };
      abortReason?: string;

      req: Request;
      res: Response;
      cookies: Record<string, string>;
      user?: UserSchema | null;
    }
  }
}

export {};
