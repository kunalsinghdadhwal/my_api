import { serve } from "@hono/node-server";
import app from "./app.js";
import { parseEnv } from "./env.js";
// eslint-disable-next-line node/no-process-env
const env = parseEnv(process.env);
const port = env.PORT;
console.log(`🔥 Server is running on http://localhost:${port}`);
console.log(`📚 API Documentation: http://localhost:${port}/reference`);
serve({
    fetch: app.fetch,
    port,
});
