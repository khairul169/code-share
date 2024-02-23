import type { UserSchema } from "./db/schema/user";

declare global {
  namespace Express {
    interface Request {
      user?: UserSchema | null;
    }
  }
}

export {};
