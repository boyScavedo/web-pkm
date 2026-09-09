import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "../src/lib/db/schema";

// Standalone migration runner.
// Usage: npx tsx scripts/migrate.ts
// Uses DATABASE_URL_UNPOOLED (direct) for schema migrations; the pooled
// endpoint rejects DDL. Falls back to DATABASE_URL for local development.
async function run() {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is not set");
  }
  const sql = neon(url);
  const db = drizzle(sql, { schema });
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("migrations applied");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});