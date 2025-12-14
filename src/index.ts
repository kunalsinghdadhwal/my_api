import { serve } from "@hono/node-server";

import app from "./app";
import { parseEnv } from "./env";

// eslint-disable-next-line node/no-process-env
const env = parseEnv(process.env);

const port = env.PORT;

console.log(`🔥 Server is running on http://localhost:${port}`);
console.log(`📚 API Documentation: http://localhost:${port}/`);

serve({
  fetch: app.fetch,
  port,
});
