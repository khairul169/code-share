import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import db from "./index";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

migrate(db, { migrationsFolder: __dirname + "/drizzle" });
process.exit();
