import { z } from "zod";

export const projectSettingsSchema = z
  .object({
    title: z.string().min(6),
    // slug: z.string().min(8),
    visibility: z.enum(["public", "private", "unlisted"]),

    settings: z.object({
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
    }),
  })
  .superRefine((val, ctx) => {
    const { settings } = val;

    if (settings.css.tailwindcss && settings.css.preprocessor !== "postcss") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Preprocessor need to be set to PostCSS to use tailwindcss.",
        path: ["settings.css.preprocessor"],
      });
    }
  });

export type ProjectSettingsSchema = z.infer<typeof projectSettingsSchema>;
