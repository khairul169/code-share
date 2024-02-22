import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import Database from "better-sqlite3";
import * as schema from "./schema/_schema";

const sqlite = new Database(path.join(process.cwd(), "storage/database.db"));
const db = drizzle(sqlite, { schema });

export default db;
