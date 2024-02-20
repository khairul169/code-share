import path from "node:path";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema/_schema.ts",
  out: "./src/server/db/drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: path.join(process.cwd(), "storage/database.db"),
  },
} satisfies Config;
