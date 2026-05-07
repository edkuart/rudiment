import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

export const pool = new Pool({
  ...(env.DATABASE_URL ? { connectionString: env.DATABASE_URL } : {}),
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

export const db = drizzle(pool, { schema, logger: env.NODE_ENV === "development" });

export type Db = typeof db;
