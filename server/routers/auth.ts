import { z } from "zod";
import { procedure, router } from "../api/trpc";
import db from "../db";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { user } from "../db/schema/user";
import { verifyPassword } from "../lib/crypto";
import { createToken } from "../lib/jwt";

const authRouter = router({
  login: procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userData = await db.query.user.findFirst({
        where: and(eq(user.email, input.email), isNull(user.deletedAt)),
      });

      if (!userData) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email is not found!",
        });
      }

      if (!(await verifyPassword(userData.password, input.password))) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid password!",
        });
      }

      // set user token
      const token = await createToken({ id: userData.id });
      ctx.res.cookie("auth-token", token, { httpOnly: true });

      return { ...userData, password: undefined };
    }),

  logout: procedure.mutation(({ ctx }) => {
    ctx.res.cookie("auth-token", null, {
      httpOnly: true,
      expires: new Date(0),
    });

    return true;
  }),
});

export default authRouter;
