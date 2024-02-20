import { and, eq, isNull } from "drizzle-orm";
import db from "../db";
import { procedure, router } from "../trpc";
import { file, insertFileSchema, selectFileSchema } from "../db/schema/file";
import { z } from "zod";

const fileRouter = router({
  getAll: procedure.query(async () => {
    const files = await db.query.file.findMany({
      where: and(isNull(file.deletedAt)),
      columns: { content: false },
    });

    return files;
  }),

  getById: procedure.input(z.number()).query(async ({ input }) => {
    return db.query.file.findFirst({
      where: and(eq(file.id, input), isNull(file.deletedAt)),
    });
  }),

  create: procedure
    .input(insertFileSchema.pick({ parentId: true, filename: true }))
    .mutation(async ({ input }) => {
      const data: z.infer<typeof insertFileSchema> = {
        userId: 1,
        parentId: input.parentId,
        path: input.filename,
        filename: input.filename,
      };

      const [result] = await db.insert(file).values(data).returning();
      return result;
    }),

  update: procedure
    .input(selectFileSchema.partial().required({ id: true }))
    .mutation(async ({ input }) => {
      const [result] = await db
        .update(file)
        .set(input)
        .where(and(eq(file.id, input.id), isNull(file.deletedAt)))
        .returning();
      return result;
    }),
});

export default fileRouter;
