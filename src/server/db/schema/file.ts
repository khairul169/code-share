import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  foreignKey,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./user";

export const file = sqliteTable(
  "files",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    parentId: integer("parent_id"),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    path: text("path").notNull().unique(),
    filename: text("filename").notNull().unique(),
    isDirectory: integer("is_directory", { mode: "boolean" })
      .notNull()
      .default(false),
    isFile: integer("is_file", { mode: "boolean" }).notNull().default(false),
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
  })
);

export const insertFileSchema = createInsertSchema(file);
export const selectFileSchema = createSelectSchema(file);

export type FileSchema = z.infer<typeof selectFileSchema>;
