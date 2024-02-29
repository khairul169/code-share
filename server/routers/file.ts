import { and, asc, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import db from "../db";
import { procedure, router } from "../api/trpc";
import { file, insertFileSchema, selectFileSchema } from "../db/schema/file";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getProjectById, hasPermission } from "./project";

const fileRouter = router({
  getAll: procedure
    .input(
      z.object({
        projectId: z.number(),
        id: z.number().array().min(1).optional(),
        isPinned: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input: opt }) => {
      const project = await getProjectById(opt.projectId);

      if (!hasPermission(ctx, project, "r")) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const files = await db.query.file.findMany({
        where: and(
          eq(file.projectId, opt.projectId),
          isNull(file.deletedAt),
          opt.id && opt.id.length > 0 ? inArray(file.id, opt.id) : undefined,
          opt.isPinned ? eq(file.isPinned, true) : undefined
        ),
        orderBy: [desc(file.isDirectory), asc(file.filename)],
        columns: !file.isPinned ? { content: true } : undefined,
      });

      return files;
    }),

  getById: procedure.input(z.number()).query(async ({ ctx, input }) => {
    const result = await db.query.file.findFirst({
      where: and(eq(file.id, input), isNull(file.deletedAt)),
      with: { project: { columns: { visibility: true, userId: true } } },
    });

    if (!result) {
      return undefined;
    }

    if (!hasPermission(ctx, result?.project, "r")) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return result;
  }),

  create: procedure
    .input(
      insertFileSchema.pick({
        projectId: true,
        parentId: true,
        filename: true,
        isDirectory: true,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await getProjectById(input.projectId);

      if (!hasPermission(ctx, project, "w")) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      let basePath = "";
      if (input.parentId) {
        const parent = await db.query.file.findFirst({
          where: and(eq(file.id, input.parentId), isNull(file.deletedAt)),
        });

        if (!parent?.isDirectory) {
          throw new Error("Parent is not a directory!");
        }
        basePath = parent.path + "/";
      }

      const data: z.infer<typeof insertFileSchema> = {
        projectId: project.id,
        parentId: input.parentId,
        path: basePath + input.filename,
        filename: input.filename,
        isDirectory: input.isDirectory,
      };

      const [result] = await db.insert(file).values(data).returning();
      return result;
    }),

  update: procedure
    .input(selectFileSchema.partial().required({ id: true, projectId: true }))
    .mutation(async ({ ctx, input }) => {
      const fileData = await db.query.file.findFirst({
        where: and(
          eq(file.projectId, input.projectId),
          eq(file.id, input.id),
          isNull(file.deletedAt)
        ),
        with: { project: { columns: { visibility: true, userId: true } } },
      });

      if (!fileData) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!hasPermission(ctx, fileData.project, "w")) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return db.transaction(async (tx) => {
        const data = { ...input };

        // also rename path
        if (data.filename) {
          const path = fileData.path.split("/");
          const idx = path.length - 1;
          path[idx] = data.filename;
          data.path = path.join("/");

          // recursively update files path in directory
          if (data.isDirectory) {
            await renameFilesPath(fileData.id, idx, data.filename, tx);
          }
        }

        const [result] = await tx
          .update(file)
          .set(data)
          .where(and(eq(file.id, input.id), isNull(file.deletedAt)))
          .returning();

        return result;
      });
    }),

  delete: procedure.input(z.number()).mutation(async ({ ctx, input }) => {
    const fileData = await db.query.file.findFirst({
      where: and(eq(file.id, input), isNull(file.deletedAt)),
      with: { project: { columns: { visibility: true, userId: true } } },
    });
    if (!fileData) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    if (!hasPermission(ctx, fileData.project, "w")) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return db.transaction(async (tx) => {
      const [result] = await tx
        .update(file)
        .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(file.id, fileData.id))
        .returning();

      if (fileData.isDirectory) {
        await deleteChildrenFiles(fileData.id, tx);
      }

      return result;
    });
  }),
});

const renameFilesPath = async (
  id: number,
  idx: number,
  pathname: string,
  tx: typeof db
) => {
  const files = await tx.query.file.findMany({
    where: and(eq(file.parentId, id), isNull(file.deletedAt)),
  });

  if (!files.length) {
    return;
  }

  for (const f of files) {
    const path = f.path.split("/");
    if (idx >= 0 && idx < path.length) {
      path[idx] = pathname;
    }

    await tx
      .update(file)
      .set({ path: path.join("/") })
      .where(and(eq(file.id, f.id), isNull(file.deletedAt)))
      .execute();

    if (f.isDirectory) {
      await renameFilesPath(f.id, idx, pathname, tx);
    }
  }
};

const deleteChildrenFiles = async (id: number, tx: typeof db) => {
  const files = await tx.query.file.findMany({
    where: and(eq(file.parentId, id), isNull(file.deletedAt)),
  });

  if (!files.length) {
    return;
  }

  for (const f of files) {
    await tx
      .update(file)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(file.id, f.id))
      .execute();

    if (f.isDirectory) {
      await deleteChildrenFiles(f.id, tx);
    }
  }
};

export default fileRouter;
