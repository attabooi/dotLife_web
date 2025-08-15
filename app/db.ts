import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const clint = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(clint);

export default db;



