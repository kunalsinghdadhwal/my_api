import { pinoLogger } from "hono-pino";
import pretty from "pino-pretty";

import env from "../env.js";

export function logger() {
  return pinoLogger({
    pino: (
      env.NODE_ENV === "production" ? undefined : pretty(),
      {
        level: env.LOG_LEVEL || "info",
      }),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  });
}
