import { defineConfig } from "drizzle-kit";

// pg push / migrations need DATABASE_URL_UNPOOLED set.
// `drizzle-kit generate` works without it (pure schema → SQL).
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url,
  },
  // The search_vector column uses a generated tsvector expression.
  // pg_trgm and ltree extensions are enabled in the migration SQL.
  extensionsFilters: [],
  verbose: true,
  strict: true,
});