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
import { file } from "../db/schema/file";

const projectRouter = router({
  getAll: procedure
    .input(z.object({ owned: z.boolean() }).partial().optional())
    .query(async ({ ctx, input: opt }) => {
      if (opt?.owned && !ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const where = [
        !opt?.owned
          ? eq(project.visibility, "public")
          : eq(project.userId, ctx.user!.id),
        isNull(project.deletedAt),
      ];

      const projects = await db.query.project.findMany({
        where: and(...(where.filter((i) => i != null) as any)),
        columns: { settings: false },
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
      let userId = ctx.user?.id;

      return db.transaction(async (tx) => {
        if (input.user && !userId) {
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

        const [projectData] = await tx.insert(project).values(data).returning();
        const projectId = projectData.id;

        if (input.forkFromId) {
          const forkProject = await tx.query.project.findFirst({
            where: and(
              eq(project.id, input.forkFromId),
              isNull(project.deletedAt)
            ),
          });

          if (!forkProject) {
            throw new Error("Fork Project not found!");
          }

          const forkFiles = await tx.query.file.findMany({
            where: and(
              eq(file.projectId, input.forkFromId),
              isNull(file.deletedAt)
            ),
            columns: {
              id: false,
              projectId: false,
              createdAt: false,
              deletedAt: false,
            },
          });

          await tx
            .insert(file)
            .values(forkFiles.map((file) => ({ ...file, projectId })));

          await tx
            .update(project)
            .set({ settings: forkProject.settings })
            .where(eq(project.id, projectData.id));
        } else {
          await tx.insert(file).values([
            {
              projectId,
              path: "index.html",
              filename: "index.html",
              content: "<p>Open index.html to edit this file.</p>",
              isPinned: true,
            },
          ]);
        }

        return projectData;
      });
    }),

  update: procedure
    .input(
      selectProjectSchema
        .partial()
        .omit({ slug: true, userId: true })
        .required({ id: true })
    )
    .mutation(async ({ input }) => {
      const data = { ...input };

      const projectData = await db.query.project.findFirst({
        where: and(eq(project.id, input.id), isNull(project.deletedAt)),
      });
      if (!projectData) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (data.settings) {
        data.settings = Object.assign(
          projectData.settings || {},
          data.settings
        );
      }

      const [result] = await db
        .update(project)
        .set(data)
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
