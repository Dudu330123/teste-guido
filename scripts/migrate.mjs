import { readFile } from "node:fs/promises";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Configure local PostgreSQL first.");
}

const pool = new Pool({ connectionString: databaseUrl });
try {
  const sql = await readFile(new URL("../db/migrations/001_independent_foundation.sql", import.meta.url), "utf8");
  await pool.query(sql);
  console.log("Database migration applied: 001_independent_foundation.sql");
} finally {
  await pool.end();
}
