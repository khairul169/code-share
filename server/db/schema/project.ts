import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./user";
import { file } from "./file";

export const project = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text("deleted_at"),
});

export const projectRelations = relations(project, ({ one, many }) => ({
  files: many(file),
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
}));

export const insertProjectSchema = createInsertSchema(project);
export const selectProjectSchema = createSelectSchema(project);

export type ProjectSchema = z.infer<typeof selectProjectSchema>;
