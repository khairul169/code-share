import { and, desc, eq, isNull, sql } from "drizzle-orm";
import db from "../db";
import { procedure, router } from "../api/trpc";
import {
  project,
  insertProjectSchema,
  selectProjectSchema,
} from "../db/schema/project";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { uid } from "../lib/utils";
import { insertUserSchema, user } from "../db/schema/user";
import { faker } from "@faker-js/faker";
import { ucwords } from "~/lib/utils";
import { hashPassword } from "../lib/crypto";
import { createToken } from "../lib/jwt";

const projectRouter = router({
  getAll: procedure.query(async () => {
    const where = and(isNull(project.deletedAt));

    const projects = await db.query.project.findMany({
      where,
      with: {
        user: { columns: { password: false } },
      },
      orderBy: [desc(project.id)],
    });

    return projects;
  }),

  getById: procedure
    .input(z.number().or(z.string()))
    .query(async ({ input }) => {
      const where = and(
        typeof input === "string"
          ? eq(project.slug, input)
          : eq(project.id, input),
        isNull(project.deletedAt)
      );

      return db.query.project.findFirst({
        where,
        with: {
          user: { columns: { password: false } },
        },
      });
    }),

  create: procedure
    .input(
      insertProjectSchema
        .pick({
          title: true,
        })
        .merge(
          z.object({
            forkFromId: z.number().optional(),
            user: insertUserSchema
              .pick({
                name: true,
                email: true,
                password: true,
              })
              .optional(),
          })
        )
    )
    .mutation(async ({ ctx, input }) => {
      const title =
        input.title.length > 0 ? input.title : ucwords(faker.lorem.words(2));
      let userId = 0;

      return db.transaction(async (tx) => {
        if (input.user) {
          const [usr] = await tx
            .insert(user)
            .values({
              ...input.user,
              password: await hashPassword(input.user.password),
            })
            .returning();

          userId = usr.id;

          // set user token
          const token = await createToken({ id: userId });
          ctx.res.cookie("auth-token", token, { httpOnly: true });
        }

        if (!userId) {
          throw new Error("Invalid userId!");
        }

        const data: z.infer<typeof insertProjectSchema> = {
          userId,
          title,
          slug: uid(),
        };

        const [result] = await tx.insert(project).values(data).returning();

        return result;
      });
    }),

  update: procedure
    .input(selectProjectSchema.partial().required({ id: true }))
    .mutation(async ({ input }) => {
      const projectData = await db.query.project.findFirst({
        where: and(eq(project.id, input.id), isNull(project.deletedAt)),
      });
      if (!projectData) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const [result] = await db
        .update(project)
        .set(input)
        .where(and(eq(project.id, input.id), isNull(project.deletedAt)))
        .returning();

      return result;
    }),

  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    const projectData = await db.query.project.findFirst({
      where: and(eq(project.id, input), isNull(project.deletedAt)),
    });
    if (!projectData) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const [result] = await db
      .update(project)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(project.id, projectData.id))
      .returning();

    return result;
  }),

  getTemplates: procedure.query(() => {
    return [
      {
        title: "Empty Project",
        projectId: 0,
      },
      {
        title: "Vanilla HTML+CSS+JS",
        projectId: 1,
      },
      {
        title: "React + Tailwindcss",
        projectId: 2,
      },
    ];
  }),
});

export default projectRouter;
