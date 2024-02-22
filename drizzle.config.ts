import type { Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema/_schema.ts",
  out: "./server/db/drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./storage/database.db",
  },
} satisfies Config;
