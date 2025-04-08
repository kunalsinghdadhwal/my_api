import env from "./src/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./src/db/migrations",
    dialect: "turso",
    dbCredentials: {
        url: env.DATABASE_URL,
        authToken: env.DATABASE_AUTH_TOKEN,
    }
})