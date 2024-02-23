import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt";
import db from "../db";
import { and, eq, isNull } from "drizzle-orm";
import { user } from "../db/schema/user";

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies["auth-token"];
    if (!token) {
      throw new Error("No token in cookies.");
    }

    const data = await verifyToken(token);
    if (!data?.id) {
      throw new Error("Invalid token!");
    }

    const userData = await db.query.user.findFirst({
      where: and(eq(user.id, data.id), isNull(user.deletedAt)),
      columns: { password: false },
    });
    if (!userData) {
      throw new Error("User is not found!");
    }

    // store userdata to every request
    (req as any).user = userData;
  } catch (err) {
    //
  }

  next();
};
