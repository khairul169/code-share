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
      insertProjectSchema.pick({
        title: true,
      })
    )
    .mutation(async ({ input }) => {
      const data: z.infer<typeof insertProjectSchema> = {
        userId: 1,
        title: input.title,
        slug: uid(),
      };

      const [result] = await db.insert(project).values(data).returning();
      return result;
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
});

export default projectRouter;
