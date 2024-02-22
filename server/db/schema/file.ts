import { relations, sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  foreignKey,
  index,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { project } from "./project";

export const file = sqliteTable(
  "files",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => project.id),
    parentId: integer("parent_id"),
    path: text("path").notNull(),
    filename: text("filename").notNull(),
    isDirectory: integer("is_directory", { mode: "boolean" })
      .notNull()
      .default(false),
    isFile: integer("is_file", { mode: "boolean" }).notNull().default(false),
    isPinned: integer("is_pinned", { mode: "boolean" })
      .notNull()
      .default(false),
    content: text("content"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text("deleted_at"),
  },
  (table) => ({
    parentFk: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "parent_id_fk",
    }),
    pathIdx: index("file_path_idx").on(table.path),
    filenameIdx: index("file_name_idx").on(table.filename),
  })
);

export const fileRelations = relations(file, ({ one }) => ({
  project: one(project, {
    fields: [file.projectId],
    references: [project.id],
  }),
}));

export const insertFileSchema = createInsertSchema(file);
export const selectFileSchema = createSelectSchema(file);

export type FileSchema = z.infer<typeof selectFileSchema>;
