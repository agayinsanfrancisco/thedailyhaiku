import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy: postgres-js doesn't connect until the first query, so `next build`
// (dynamic pages only) compiles fine without a reachable database.
const client = postgres(process.env.DATABASE_URL ?? "postgres://localhost:5432/thedailyhaiku", {
  max: 5,
  prepare: false,
});

export const db = drizzle(client, { schema });
