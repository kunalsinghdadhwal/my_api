import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.js";
export function createDb(env) {
    console.log(env);
    const client = createClient({
        url: env.DATABASE_URL,
        authToken: env.DATABASE_AUTH_TOKEN,
    });
    const db = drizzle(client, {
        schema,
    });
    return { db, client };
}
