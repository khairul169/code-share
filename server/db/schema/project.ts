import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./user";
import { file } from "./file";

const defaultSettings: ProjectSettingsSchema = {
  css: {
    preprocessor: null,
    tailwindcss: false,
  },
  js: {
    transpiler: null,
    packages: [],
  },
};

export const project = sqliteTable(
  "projects",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => user.id),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),

    visibility: text("visibility", {
      enum: ["public", "private", "unlisted"],
    }).default("private"),

    settings: text("settings", { mode: "json" })
      .$type<Partial<ProjectSettingsSchema>>()
      .default(defaultSettings),

    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: text("deleted_at"),
  },
  (table) => ({
    visibilityEnum: index("project_visibility_idx").on(table.visibility),
  })
);

export const projectRelations = relations(project, ({ one, many }) => ({
  files: many(file),
  user: one(user, {
    fields: [project.userId],
    references: [user.id],
  }),
}));

export const projectSettingsSchema = z.object({
  css: z.object({
    preprocessor: z.enum(["", "postcss"]).optional().nullable(),
    tailwindcss: z.boolean().optional().nullable(),
  }),

  js: z.object({
    transpiler: z.enum(["", "swc"]).optional().nullable(),
    packages: z
      .object({ name: z.string().min(1), url: z.string().min(1).url() })
      .array(),
  }),
});

export type ProjectSettingsSchema = z.infer<typeof projectSettingsSchema>;

export const insertProjectSchema = createInsertSchema(project, {
  settings: projectSettingsSchema,
});
export const selectProjectSchema = createSelectSchema(project, {
  settings: projectSettingsSchema.partial(),
});

export type ProjectSchema = z.infer<typeof selectProjectSchema>;
