import { logger } from "hono-pino";
import { randomUUID } from "node:crypto";
import pino from "pino";
import pretty from "pino-pretty";
export function pinoLogger() {
    return ((c, next) => logger({
        pino: pino({
            level: c.env?.LOG_LEVEL || "info",
        }, c.env?.NODE_ENV === "production" ? undefined : pretty()),
        http: {
            reqId: () => randomUUID(),
        },
    })(c, next));
}
