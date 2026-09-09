import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy db factory. Throws only when a query actually runs without a
// connection string, so the app builds and signs in before DATABASE_URL
// exists (JWT session strategy needs no DB).
export function createDb(url: string) {
  return drizzle(neon(url), { schema });
}

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local");
  }
  return createDb(url);
}

export { schema };