import { createHash, timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb, schema } from "@/lib/db";

// Adapter attaches once DATABASE_URL exists. With JWT session strategy the
// adapter is only used to persist OAuth accounts, so sign-in works without it.
const hasDb = Boolean(process.env.DATABASE_URL);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(hasDb
    ? {
        adapter: DrizzleAdapter(getDb(), {
          usersTable: schema.users,
          accountsTable: schema.accounts,
          sessionsTable: schema.sessions,
          verificationTokensTable: schema.verificationTokens,
        }),
      }
    : {}),
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async ({ email, password }) => {
        const adminEmail = process.env.PKM_EMAIL;
        const adminPassword = process.env.PKM_PASSWORD;
        // ponytail: single-user env credential, sha256 + timingSafeEqual.
        // Upgrade to bcrypt/argon2 backed by the users table when the
        // account system moves into the database.
        if (!adminEmail || !adminPassword) return null;
        if (typeof email !== "string" || typeof password !== "string") return null;
        if (email !== adminEmail) return null;

        const a = createHash("sha256").update(password).digest();
        const b = createHash("sha256").update(adminPassword).digest();
        if (a.length !== b.length) return null;
        return timingSafeEqual(a, b)
          ? { id: "1", email, name: "pk" }
          : null;
      },
    }),
  ],
  trustHost: true,
});