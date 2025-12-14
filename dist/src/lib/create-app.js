import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import { parseEnv } from "../env.js";
import { pinoLogger } from "../middlewares/pino-logger.js";
export function createRouter() {
    return new OpenAPIHono({
        strict: false,
        defaultHook,
    });
}
export default function createApp() {
    const app = createRouter();
    app.use((c, next) => {
        // eslint-disable-next-line node/no-process-env
        c.env = parseEnv(Object.assign(c.env || {}, process.env));
        return next();
    });
    // Security headers
    app.use(secureHeaders());
    // Request ID for tracing
    app.use(requestId());
    // CORS middleware - allow all origins in development
    app.use(cors({
        origin: "*",
        allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        exposeHeaders: ["X-Total-Count", "X-Request-Id"],
        maxAge: 86400,
        credentials: true,
    }));
    app.use(serveEmojiFavicon("📝"));
    app.use(pinoLogger());
    app.notFound(notFound);
    app.onError(onError);
    return app;
}
export function createTestApp(router) {
    return createApp().route("/", router);
}
